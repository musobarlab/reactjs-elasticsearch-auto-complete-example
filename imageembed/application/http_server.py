import uvicorn
import typing

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException

from application import (
    errors
)

from application.logger import logger as log

class HttpServer:
    def __init__(self, http_port: int, base_path: str, cors_origins=typing.List[str]) -> None:
        self.app = FastAPI()

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=cors_origins,
            allow_credentials=True,
            allow_methods=['*'],
            allow_headers=['*'],
        )
        self.__setup_error_handler()
        
        self.base_router = APIRouter(prefix=base_path)
        
        # https://www.uvicorn.org/#running-programmatically
        config = uvicorn.Config(
            host='0.0.0.0',
            app=self.app, 
            port=int(http_port),
            proxy_headers=True,
            forwarded_allow_ips='*', # trust proxy headers from the ip of your reverse proxy
            log_level="info"
        )
        
        self.uvicorn_server = uvicorn.Server(config)
    
    def register_router(self, router: APIRouter):
        self.base_router.include_router(router=router)
    
    def register_middleware(self, middleware_func: typing.Callable):
        self.app.middleware('http')(middleware_func)
    
    def register_app(self):
        self.app.include_router(router=self.base_router)

    async def start(self):
        log.info('starting HTTP Server')

        # https://www.uvicorn.org/#config-and-server-instances
        await self.uvicorn_server.serve()
    
    def on_start(self, start_func: typing.Callable):
        log.info('HTTP Server on_start fired')
        self.app.on_event('startup')(start_func)

    def on_stop(self, stop_func: typing.Callable):
        log.info('HTTP Server on_stop fired')
        self.app.on_event('shutdown')(stop_func)

    def __setup_error_handler(self):
        self.app.exception_handler(RequestValidationError)(errors.request_validation_error_handler)
        self.app.exception_handler(HTTPException)(errors.exception_handler)
        self.app.exception_handler(errors.CustomHttpException)(errors.custom_exception_handler)
