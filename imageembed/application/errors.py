import typing
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from application.logger import logger as log

class CustomHttpException(Exception):
    def __init__(self, http_code: int, message: str, data: typing.Any, success = False):
        self.http_code = http_code
        self.content = {
            'success': success,
            'message': message,
            'data': data
        }

async def custom_exception_handler(request: Request, ex: CustomHttpException):
    log.error(ex.content['message'])
    return JSONResponse(
        status_code=ex.http_code,
        content=ex.content
    )

async def exception_handler(request: Request, ex: HTTPException):
    log.error(ex.detail)
    content = {
        'success': False,
        'message': 'error handling request'
    }
    
    if ex.status_code == 404:
        content.update({'message': 'not found'})
    elif ex.status_code == 401:
        content.update({'message': 'invalid authorization'})
    elif ex.status_code == 500:
        content.update({'message': 'internal server error'})

    return JSONResponse(
        status_code=ex.status_code,
        content=content
    )

async def request_validation_error_handler(request: Request, ex: RequestValidationError):
    log.error(ex.raw_errors)
    return JSONResponse(
        status_code=400,
        content={
            'success': False,
            'message': 'request is invalid'
        }
    )
