<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GenerateRoadmapRequest extends FormRequest
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
            'career_path_id' => ['required', 'integer', 'exists:career_paths,id'],
            'assessment_attempt_id' => ['sometimes', 'nullable', 'integer', 'exists:assessment_attempts,id'],
            'orientation_result_id' => ['sometimes', 'nullable', 'integer', 'exists:orientation_results,id'],
            'career_goals' => ['sometimes', 'nullable', 'string', 'max:500'],
            'focus_areas' => ['sometimes', 'nullable', 'array', 'max:20'],
            'focus_areas.*' => ['string', 'max:100'],
            'target_hours_per_week' => ['sometimes', 'nullable', 'integer', 'min:2', 'max:60'],
            'duration_days' => ['sometimes', 'nullable', 'integer', 'in:30,60,90'],
            'force_regenerate' => ['sometimes', 'nullable', 'boolean'],
            'reuse_existing' => ['sometimes', 'nullable', 'boolean'],
        ];
    }
}
