<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    // ✅ Retourne JSON au lieu de view()
    public function show(User $user)
    {
        if ($user->id === Auth::id()) {
            return response()->json(['error' => 'Action non autorisée'], 403);
        }

        // Marquer les messages reçus comme lus
        Message::where('sender_id', $user->id)
            ->where('receiver_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Récupérer la conversation
        $messages = Message::where(function ($q) use ($user) {
                $q->where('sender_id', Auth::id())
                  ->where('receiver_id', $user->id);
            })
            ->orWhere(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->where('receiver_id', Auth::id());
            })
            ->with('sender:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages); // ✅ JSON, pas de view()
    }

    public function store(Request $request, User $user)
    {
        if ($user->id === Auth::id()) {
            return response()->json(['error' => 'Action non autorisée'], 403);
        }

        $request->validate(['body' => 'required|string|max:1000']);

        $message = Message::create([
            'sender_id'   => Auth::id(),
            'receiver_id' => $user->id,
            'body'        => $request->body,
        ]);

        return response()->json($message, 201); // ✅ JSON avec status 201
    }

    public function unreadCount()
    {
        $count = Message::where('receiver_id', Auth::id())
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]); // ✅ JSON
    }
}