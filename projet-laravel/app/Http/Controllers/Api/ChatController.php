<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Liste toutes les conversations de l'utilisateur connecté.
     */
    public function index()
    {
        $user = auth()->user();

        $conversations = $user->conversations()
            ->with([
                // ⚠️ Ne pas faire de select() partiel ici — ça casse les relations
                'users:id,name,email,photo,role',
                // lastMessage via subquery manuelle pour compatibilité Laravel 8/9/10/11
                'messages' => function ($q) {
                    $q->latest()->limit(1);
                },
                'messages.user:id,name,photo',
            ])
            ->latest('updated_at')
            ->get()
            ->map(function ($conv) use ($user) {
                // Reformater pour exposer un champ "last_message" propre
                $lastMsg = $conv->messages->first();
                return [
                    'id'           => $conv->id,
                    'name'         => $conv->name,
                    'created_at'   => $conv->created_at,
                    'updated_at'   => $conv->updated_at,
                    'users'        => $conv->users,
                    'last_message' => $lastMsg ? [
                        'id'              => $lastMsg->id,
                        'content'         => $lastMsg->content,
                        'user_id'         => $lastMsg->user_id,
                        'seen'            => (bool) $lastMsg->seen,
                        'created_at'      => $lastMsg->created_at,
                        'user'            => $lastMsg->user,
                    ] : null,
                ];
            });

        return response()->json($conversations);
    }

    /**
     * Créer ou retrouver une conversation entre deux (ou plusieurs) utilisateurs.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_ids'   => 'required|array|min:2',
            'user_ids.*' => 'exists:users,id',
        ]);

        $userIds = array_map('intval', $request->user_ids);
        sort($userIds);

        // Chercher une conversation privée (exactement ces 2 utilisateurs)
        // Compatible PostgreSQL — on évite withCount + having
        if (count($userIds) === 2) {
            // Récupérer toutes les conversations auxquelles participent les 2 users
            $conv1 = \DB::table('conversation_user')
                ->where('user_id', $userIds[0])
                ->pluck('conversation_id');

            $conv2 = \DB::table('conversation_user')
                ->where('user_id', $userIds[1])
                ->pluck('conversation_id');

            // Intersection = conversations communes aux 2
            $commonIds = $conv1->intersect($conv2)->values();

            // Parmi ces conversations, trouver celle qui a exactement 2 membres
            $existing = null;
            foreach ($commonIds as $convId) {
                $count = \DB::table('conversation_user')
                    ->where('conversation_id', $convId)
                    ->count();
                if ($count === 2) {
                    $existing = Conversation::find($convId);
                    break;
                }
            }

            if ($existing) {
                return response()->json(
                    $existing->load('users:id,name,email,photo,role'),
                    200
                );
            }
        }

        $conversation = Conversation::create();
        $conversation->users()->attach($userIds);

        return response()->json(
            $conversation->load('users:id,name,email,photo,role'),
            201
        );
    }

    /**
     * Retourner les messages d'une conversation.
     */
    public function show(Conversation $conversation)
    {
        if (!$conversation->users()->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $messages = $conversation->messages()
            ->with('user:id,name,photo')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id'              => $msg->id,
                    'conversation_id' => $msg->conversation_id,
                    'user_id'         => $msg->user_id,
                    'content'         => $msg->content,
                    'seen'            => (bool) $msg->seen,
                    'created_at'      => $msg->created_at,
                    'updated_at'      => $msg->updated_at,
                    'user'            => $msg->user,
                ];
            });

        return response()->json($messages);
    }

    /**
     * Envoyer un message dans une conversation.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate(['content' => 'required|string|max:5000']);

        if (!$conversation->users()->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id'         => auth()->id(),
            'content'         => $request->content,
            'seen'            => false,
        ]);

        // Mettre à jour updated_at de la conversation (pour trier la sidebar)
        $conversation->touch();

        return response()->json($message->load('user:id,name,photo'), 201);
    }

    /**
     * Marquer tous les messages non lus (pas du user connecté) comme lus.
     */
    public function markAsRead(Conversation $conversation)
    {
        if (!$conversation->users()->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $count = Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', auth()->id())
            ->where('seen', false)
            ->update(['seen' => true]);

        return response()->json([
            'message' => 'Messages marqués comme lus',
            'updated' => $count,
        ]);
    }

    public function updateMessage(Request $request, Message $message)
    {
        // Seul l'auteur peut modifier
        if ($message->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
    
        $request->validate(['content' => 'required|string|max:5000']);
    
        $message->update([
            'content' => $request->content,
            'edited'  => true,   
        ]);
    
        return response()->json($message->load('user:id,name,photo'));
    }

    public function destroyMessage(Message $message)
    {
        if ($message->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
    
        $message->delete();
    
        return response()->json(['message' => 'Message supprimé'], 200);
    }

}