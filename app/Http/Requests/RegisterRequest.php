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
                Password::min(6),
                $this->has('password_confirmation') ? 'confirmed' : null,
            ])),
            'role' => ['sometimes', 'string', 'in:student,counselor'],
            'education_level' => ['sometimes', 'nullable', 'string', 'max:100'],
            'field_of_study' => ['sometimes', 'nullable', 'string', 'max:150'],
            'target_role' => ['sometimes', 'nullable', 'string', 'max:150'],
        ];
    }
}
