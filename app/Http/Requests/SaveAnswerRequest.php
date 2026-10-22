<?php

namespace App\Http\Requests;

use App\Models\AssessmentQuestion;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveAnswerRequest extends FormRequest
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
            'question_id' => ['required', 'integer', 'exists:assessment_questions,id'],
            'selected_option' => ['required', 'string', 'max:100'],
            'answer_text' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Configure the validator instance with custom question option validation.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $questionId = $this->input('question_id');
            $selectedOption = $this->input('selected_option');

            if ($questionId && $selectedOption) {
                $question = AssessmentQuestion::find($questionId);

                if (! $question) {
                    return;
                }

                if (! $question->is_active) {
                    $validator->errors()->add('question_id', 'This question is currently inactive.');

                    return;
                }

                $validValues = collect($question->options ?? [])->pluck('value')->all();

                if (! in_array($selectedOption, $validValues, true)) {
                    $validator->errors()->add('selected_option', 'The selected option is invalid for this question.');
                }
            }
        });
    }
}
