<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => array_values(array_filter([
                'required',
                'string',
                Password::min(8)->letters()->numbers(),
                $this->has('password_confirmation') ? 'confirmed' : null,
            ])),
            'verification_code' => ['sometimes', 'nullable', 'string', 'size:6'],
            'role' => ['sometimes', 'string', 'in:student,counselor'],
            'education_level' => ['sometimes', 'nullable', 'string', 'max:100'],
            'field_of_study' => ['sometimes', 'nullable', 'string', 'max:150'],
            'target_role' => ['sometimes', 'nullable', 'string', 'max:150'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'name.min' => 'Le nom doit comporter au moins 2 caractères.',
            'email.required' => "L'adresse email est obligatoire.",
            'email.email' => 'Veuillez saisir une adresse email valide.',
            'email.unique' => 'Cette adresse email est déjà associée à un compte. Veuillez vous connecter.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'verification_code.size' => 'Le code de vérification doit comporter exactement 6 chiffres.',
        ];
    }
}
