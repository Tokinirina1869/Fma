<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function index()
    {
        Log::info('Méthode index appelée'); // facultatif
        $users = User::where('id', '!=', auth()->id())
                    ->select('id', 'name', 'email', 'photo', 'role')
                    ->get();
        return response()->json($users);
    }

    public function register(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => [
                'required', 
                'in:' . implode(',', array_keys(User::getRoles())),
                function ($attribute, $value, $fail) {
                    $uniqueRoles = ['directrice', 'bde'];
                    
                    if (!in_array($value, $uniqueRoles)) {
                        return;
                    }
                    
                    if (User::where('role', $value)->exists()) {
                        $roleNames = [
                            'directrice' => 'Directrice',
                            'bde' => 'Bureau des Étudiants (BDE)'
                        ];
                        
                        $roleName = $roleNames[$value] ?? $value;
                        $fail("Un compte {$roleName} existe déjà dans le système.");
                    }
                }
            ],
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $validator->after(function ($validator) use ($request) {
            if ($request->role === 'directrice' && User::where('role', 'directrice')->exists()) {
                $validator->errors()->add('role', 'Une directrice existe déjà dans le système.');
            }
            
            if ($request->role === 'bde' && User::where('role', 'bde')->exists()) {
                $validator->errors()->add('role', 'Un compte BDE existe déjà dans le système.');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => bcrypt($request->password),
            'role'      => $request->role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $id,
            'current_password' => 'sometimes|required_with:new_password',
            'new_password' => 'sometimes|min:6|confirmed',
            'photo'    => 'sometimes'
        ]);

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'Erreur',
                'message' => "Utilisateur introuvable.",
            ], 404);
        }

        try {
            $updateData = [
                'name'  => $request->name,
                'email' => $request->email,
            ];

            /* ----------------------------
            * 1) Gestion de la photo
            * ---------------------------- */

            if ($request->hasFile('photo')) {
                // Supprimer ancienne photo si existe
                if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                    Storage::disk('public')->delete($user->photo);
                }

                // Sauvegarder nouvelle photo
                $path = $request->file('photo')->store('photos', 'public');
                $updateData['photo'] = $path;

                \Log::info("Photo upload file OK : $path");
            }
            elseif ($request->photo && strlen($request->photo) > 100) {
                // Base64 image
                $base64 = $request->photo;
                $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
                $imageData = base64_decode($base64);

                if ($imageData !== false) {
                    if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                        Storage::disk('public')->delete($user->photo);
                    }

                    $fileName = 'photos/' . uniqid() . '.png';
                    Storage::disk('public')->put($fileName, $imageData);

                    $updateData['photo'] = $fileName;

                    \Log::info("Photo base64 OK : $fileName");
                } else {
                    \Log::warning("Base64 invalide reçu.");
                }
            } else {
                \Log::info("Aucune modification de la photo.");
            }

            /* ----------------------------
            * 2) Gestion du mot de passe
            * ---------------------------- */

            if ($request->filled('new_password')) {

                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'status'  => 'Erreur',
                        'message' => 'Le mot de passe actuel est incorrect.',
                    ], 422);
                }

                $updateData['password'] = Hash::make($request->new_password);
            }

            /* ----------------------------
            * 3) Mise à jour
            * ---------------------------- */

            $user->update($updateData);
            $user->refresh();

            return response()->json([
                'status'  => 'Succès',
                'message' => 'Profil modifié avec succès.',
                'data'    => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'photo' => $user->photo ? asset('storage/' . $user->photo) : null,
                ]
            ], 200);

        } catch (\Exception $e) {

            \Log::error('Erreur modification utilisateur: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'status'  => 'Erreur Interne',
                'message' => 'Une erreur est survenue lors de la modification.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }


    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if(!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Identifiants incorrects'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(
            [
                'user'      => $user, 
                'token'     => $token,
                'token_type'=> 'Bearer', 
            ]
        );
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // Current user
    public function me(Request $request){
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    // Get Roles
    public function getRoles()
    {
        try{
            $roles = User::getRoles();
            return response()->json([
                "roles" => $roles,
                'succes'  => true,
            ]);
        }
        catch(\Exception $e){
            \Log::error('Error in getRoles:' .$e->getMessage());
            
            return response()->json([
                'ERROR '  => $e->getMessage(),
                'succes'  =>false
            ], 500);
        }        
    }
}
