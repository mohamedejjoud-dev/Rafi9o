<?php

namespace App\Http\Requests;

use App\Models\AssessmentQuestion;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveAnswersBatchRequest extends FormRequest
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
            'answers' => ['required', 'array', 'min:1', 'max:50'],
            'answers.*.question_id' => ['required', 'integer', 'exists:assessment_questions,id'],
            'answers.*.selected_option' => ['required', 'string', 'max:100'],
            'answers.*.answer_text' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Configure the validator instance with question option validation.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $answers = $this->input('answers', []);
            $questionIds = collect($answers)->pluck('question_id')->unique()->filter()->all();
            $questions = AssessmentQuestion::whereIn('id', $questionIds)->get()->keyBy('id');

            foreach ($answers as $index => $item) {
                $qId = $item['question_id'] ?? null;
                $opt = $item['selected_option'] ?? null;

                if (! $qId || ! $opt) {
                    continue;
                }

                $question = $questions->get($qId);
                if (! $question) {
                    continue;
                }

                if (! $question->is_active) {
                    $validator->errors()->add("answers.$index.question_id", "Question #$qId is currently inactive.");

                    continue;
                }

                $validValues = collect($question->options ?? [])->pluck('value')->all();
                if (! in_array($opt, $validValues, true)) {
                    $validator->errors()->add("answers.$index.selected_option", "Selected option '$opt' is invalid for question #$qId.");
                }
            }
        });
    }
}
