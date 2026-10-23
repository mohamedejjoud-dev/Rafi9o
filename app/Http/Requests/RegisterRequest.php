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
        $locale = app()->getLocale();

        if ($locale === 'ar') {
            return [
                'name.required' => 'الاسم مطلوب.',
                'name.min' => 'يجب أن يتكون الاسم من حرفين على الأقل.',
                'email.required' => 'البريد الإلكتروني مطلوب.',
                'email.email' => 'يُرجى إدخال بريد إلكتروني صالح.',
                'email.unique' => 'هذا البريد الإلكتروني مسجل بالفعل. يُرجى تسجيل الدخول.',
                'password.required' => 'كلمة المرور مطلوبة.',
                'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
                'verification_code.required' => 'رمز التحقق مطلوب.',
                'verification_code.size' => 'يجب أن يتكون رمز التحقق من 6 أرقام بالضبط.',
            ];
        }

        if ($locale === 'fr') {
            return [
                'name.required' => 'Le nom est obligatoire.',
                'name.min' => 'Le nom doit comporter au moins 2 caractères.',
                'email.required' => "L'adresse e-mail est obligatoire.",
                'email.email' => 'Veuillez saisir une adresse e-mail valide.',
                'email.unique' => 'Cette adresse e-mail est déjà enregistrée. Veuillez vous connecter.',
                'password.required' => 'Le mot de passe est obligatoire.',
                'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
                'verification_code.required' => 'Le code de vérification est obligatoire.',
                'verification_code.size' => 'Le code de vérification doit comporter exactement 6 chiffres.',
            ];
        }

        return [
            'name.required' => 'Full name is required.',
            'name.min' => 'Full name must be at least 2 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email is already registered. Please sign in.',
            'password.required' => 'Password is required.',
            'password.confirmed' => 'The password confirmation does not match.',
            'verification_code.required' => 'Verification code is required.',
            'verification_code.size' => 'The verification code must be exactly 6 digits.',
        ];
    }
}
