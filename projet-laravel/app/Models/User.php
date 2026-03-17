<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_DIRECTRICE       = 'directrice';
    const ROLE_BDE              = 'bde';
    const ROLE_SECRETAIRE_LYCEE = 'secretaire_lycee';
    const ROLE_SECRETAIRE_CFP   = 'secretaire_cfp';

    protected $fillable = [
        'name',
        'email',
        'password',
        'photo',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // ── Roles ──────────────────────────────────────────────────────────────────

    public static function getRoles(): array
    {
        return [
            self::ROLE_DIRECTRICE       => 'Directrice',
            self::ROLE_BDE              => "Bureau d'emploi",
            self::ROLE_SECRETAIRE_LYCEE => 'Secretaire Lycee',
            self::ROLE_SECRETAIRE_CFP   => 'Secretaire Cfp',
        ];
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [
            self::ROLE_DIRECTRICE,
            self::ROLE_BDE,
        ]);
    }

    public function isSecretaire(): bool
    {
        return in_array($this->role, [
            self::ROLE_SECRETAIRE_LYCEE,
            self::ROLE_SECRETAIRE_CFP,
        ]);
    }

    public static function getRolesWithAdminInfo(): array
    {
        return [
            self::ROLE_DIRECTRICE => [
                'label'       => 'Directrice',
                'is_admin'    => true,
                'description' => 'Administrateur principal',
            ],
            self::ROLE_BDE => [
                'label'       => 'Bureau des Étudiants',
                'is_admin'    => true,
                'description' => 'Administrateur',
            ],
            self::ROLE_SECRETAIRE_LYCEE => [
                'label'       => 'Secrétaire Lycée',
                'is_admin'    => false,
                'description' => 'Utilisateur standard',
            ],
            self::ROLE_SECRETAIRE_CFP => [
                'label'       => 'Secrétaire CFP',
                'is_admin'    => false,
                'description' => 'Utilisateur standard',
            ],
        ];
    }

    public function getRoleName(): string
    {
        return self::getRoles()[$this->role] ?? $this->role;
    }

    // ── Relations ──────────────────────────────────────────────────────────────

    /**
     * Les conversations auxquelles participe cet utilisateur.
     */
    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_user')
                    ->withTimestamps();
    }

    /**
     * Les messages envoyés par cet utilisateur.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}