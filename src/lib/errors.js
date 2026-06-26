export class AppError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

function isZodError(error) {
  return error?.name === 'ZodError' && Array.isArray(error.issues)
}

export function jsonError(error, fallback = 'خطای داخلی سرور') {
  if (error instanceof AppError) {
    return Response.json({ message: error.message }, { status: error.statusCode })
  }

  if (isZodError(error)) {
    return Response.json(
      { message: error.issues[0]?.message || 'داده‌های ارسالی معتبر نیست.' },
      { status: 422 },
    )
  }

  console.error(error)
  return Response.json({ message: fallback }, { status: 500 })
}
