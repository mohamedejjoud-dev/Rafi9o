<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentQuestionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_text' => $this->question_text,
            'category' => $this->category,
            'question_type' => $this->question_type,
            'options' => collect($this->options ?? [])->map(function ($option) {
                return [
                    'value' => $option['value'] ?? null,
                    'label' => $option['label'] ?? null,
                ];
            })->all(),
            'order' => $this->order,
        ];
    }
}
