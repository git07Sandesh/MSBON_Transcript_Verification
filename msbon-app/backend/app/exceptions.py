"""Custom exceptions for the MSBON system. All inherit MSBONBaseException."""


class MSBONBaseException(Exception):
    http_status: int = 500
    code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.message
        super().__init__(self.detail)


class InvalidFileTypeError(MSBONBaseException):
    http_status = 400
    code = "INVALID_FILE_TYPE"
    message = "File type is not accepted. Use PDF, PNG, JPEG, or TIFF."


class FileTooLargeError(MSBONBaseException):
    http_status = 413
    code = "FILE_TOO_LARGE"
    message = "File exceeds the 10MB size limit."


class TranscriptNotFoundError(MSBONBaseException):
    http_status = 404
    code = "TRANSCRIPT_NOT_FOUND"
    message = "Transcript not found."


class TranscriptNotProcessedError(MSBONBaseException):
    http_status = 409
    code = "TRANSCRIPT_NOT_PROCESSED"
    message = "Transcript has not been verified yet."


class FlagAlreadyReviewedError(MSBONBaseException):
    http_status = 409
    code = "FLAG_ALREADY_REVIEWED"
    message = "This flag already has a staff review."


class ExtractionFailedError(MSBONBaseException):
    http_status = 500
    code = "EXTRACTION_FAILED"
    message = "Document text extraction failed."


class LLMUnavailableError(MSBONBaseException):
    http_status = 503
    code = "LLM_UNAVAILABLE"
    message = "LLM service is unavailable."


class LLMParseError(MSBONBaseException):
    http_status = 500
    code = "LLM_PARSE_ERROR"
    message = "LLM returned an unparseable response."


class OverrideReasonRequiredError(MSBONBaseException):
    http_status = 422
    code = "OVERRIDE_REASON_REQUIRED"
    message = "override_reason is required when decision is OVERRIDDEN."


class ValidationError(MSBONBaseException):
    http_status = 422
    code = "VALIDATION_ERROR"
    message = "Request validation failed."
