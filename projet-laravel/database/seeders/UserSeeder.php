<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{

    public function run()
    {
        User::create([
            'name' => 'Robert Tokinirina',
            'email' => 'robertokinirina@gmail.com',
            'password' => Hash::make('password123'),
        ]);

        
        User::create([
            'name' => 'Robert Tokinirina1',
            'email' => 'robertokinirina1@gmail.com',
            'password' => Hash::make('password1231'),
        ]);
    }
}
