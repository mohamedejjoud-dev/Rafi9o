<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'education_level' => ['sometimes', 'nullable', 'string', 'max:100'],
            'field_of_study' => ['sometimes', 'nullable', 'string', 'max:150'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:150'],
            'graduation_year' => ['sometimes', 'nullable', 'integer', 'min:1970', 'max:2045'],
            'target_role' => ['sometimes', 'nullable', 'string', 'max:150'],
            'skills' => ['sometimes', 'nullable', 'array', 'max:50'],
            'skills.*' => ['string', 'max:50'],
            'interests' => ['sometimes', 'nullable', 'array', 'max:50'],
            'interests.*' => ['string', 'max:50'],
            'location' => ['sometimes', 'nullable', 'string', 'max:150'],
            'preferred_language' => ['sometimes', 'string', 'in:en,ar,fr'],
        ];
    }
}
