<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['file', 'max:10240'],
        ]);

        $files = collect($request->file('files'))
            ->map(function ($file) {
                $path = $file->store('uploads', 'public');

                return [
                    'name' => $file->getClientOriginalName(),
                    'url' => Storage::disk('public')->url($path),
                    'path' => $path,
                    'mime_type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ];
            })
            ->values();

        return response()->json(['data' => ['files' => $files]]);
    }
}
