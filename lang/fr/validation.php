<?php

return [
    'required' => 'Le champ :attribute est obligatoire.',
    'email' => 'Le champ :attribute doit être une adresse email valide.',
    'unique' => 'Cette valeur de :attribute est déjà utilisée.',
    'size' => [
        'string' => 'Le champ :attribute doit comporter :size caractères.',
    ],
    'min' => [
        'string' => 'Le champ :attribute doit contenir au moins :min caractères.',
    ],
    'max' => [
        'string' => 'Le champ :attribute ne peut pas dépasser :max caractères.',
    ],
    'confirmed' => 'La confirmation du champ :attribute ne correspond pas.',
    'password' => [
        'letters' => 'Le mot de passe doit contenir au moins une lettre.',
        'mixed' => 'Le mot de passe doit contenir au moins une majuscule et une minuscule.',
        'numbers' => 'Le mot de passe doit contenir au moins un chiffre.',
        'symbols' => 'Le mot de passe doit contenir au moins un symbole.',
    ],
    'custom' => [
        'email' => [
            'unique' => 'Cette adresse email est déjà associée à un compte. Veuillez vous connecter.',
        ],
        'password' => [
            'confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ],
        'verification_code' => [
            'required' => 'Le code de vérification est obligatoire.',
            'size' => 'Le code de vérification doit comporter exactement 6 chiffres.',
        ],
    ],
    'attributes' => [
        'name' => 'nom',
        'email' => 'adresse e-mail',
        'password' => 'mot de passe',
        'password_confirmation' => 'confirmation du mot de passe',
        'verification_code' => 'code de vérification',
    ],
];
