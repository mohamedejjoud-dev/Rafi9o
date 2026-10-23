<?php

return [
    'required' => 'The :attribute field is required.',
    'email' => 'The :attribute field must be a valid email address.',
    'unique' => 'The :attribute has already been taken.',
    'size' => [
        'string' => 'The :attribute field must be :size characters.',
    ],
    'min' => [
        'string' => 'The :attribute field must be at least :min characters.',
    ],
    'max' => [
        'string' => 'The :attribute field must not be greater than :max characters.',
    ],
    'confirmed' => 'The :attribute field confirmation does not match.',
    'password' => [
        'letters' => 'The :attribute field must contain at least one letter.',
        'mixed' => 'The :attribute field must contain at least one uppercase and one lowercase letter.',
        'numbers' => 'The :attribute field must contain at least one number.',
        'symbols' => 'The :attribute field must contain at least one symbol.',
    ],
    'custom' => [
        'email' => [
            'unique' => 'This email address is already registered. Please sign in.',
        ],
        'password' => [
            'confirmed' => 'Password confirmation does not match.',
        ],
        'verification_code' => [
            'required' => 'The verification code is required.',
            'size' => 'The verification code must be exactly 6 digits.',
        ],
    ],
    'attributes' => [
        'name' => 'name',
        'email' => 'email address',
        'password' => 'password',
        'password_confirmation' => 'password confirmation',
        'verification_code' => 'verification code',
    ],
];
