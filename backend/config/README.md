# Configuration Guide

## chapters.json — How to Add or Edit Chapters

The file `chapters.json` in this folder controls which chapters appear in the **Add Questions** form dropdown. It is read at runtime, so **no code changes or server restart are needed** — just save the file and the changes take effect immediately.

### Structure

```json
{
  "Subject Name": {
    "grade_number": ["Chapter 1", "Chapter 2", "Chapter 3"]
  }
}
```

- **Subject Name** — Must match the subject `title` in the database (e.g. `Maths`, `Physics`, `Biology`, `Chemistry`, `Social Science`). The lookup is case-insensitive.
- **Grade number** — A string from `"1"` to `"12"`.
- **Chapters** — An array of chapter name strings.

### Examples

#### Adding chapters for a new grade under an existing subject

To add Grade 5 chapters for Biology, insert a new entry inside the `"Biology"` block:

```json
"Biology": {
  "5": ["Living and Non-living Things", "Plants Around Us", "Food and Health"],
  "6": ["The Living Organisms and Their Surroundings", ...],
  ...
}
```

#### Adding a completely new subject

Add a new top-level key with its grades and chapters:

```json
"English": {
  "6": ["A Tale of Two Birds", "The Friendly Mongoose", "Grammar Basics"],
  "7": ["Quality", "A Gift of Chappals", "The Ashes That Made Trees Bloom"],
  "9": ["The Fun They Had", "The Sound of Music", "The Little Girl"]
}
```

> **Note:** When adding a new subject, make sure it also exists in the `subjects` database collection (via `seedSubjects.js` or the MongoDB dashboard) so it appears in the subject dropdown.

#### Adding a new chapter to an existing grade

Simply append the chapter name to the array:

```json
"Maths": {
  "9": ["Number Systems", "Polynomials", ..., "Probability", "New Chapter Name"]
}
```

### Rules

1. **Valid JSON** — Make sure the file is valid JSON after editing. Use a JSON validator or your editor's built-in checker.
2. **No trailing commas** — JSON does not allow trailing commas after the last item in an array or object.
3. **Matching subject names** — The subject name here must match the `title` field from the subjects collection (case-insensitive).
4. **No restart required** — The backend reads this file fresh on every request, so changes are picked up instantly.
