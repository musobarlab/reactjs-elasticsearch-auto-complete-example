import asyncio

from application.router import router as index_router
from application.logger import logger as log
from application.http_server import HttpServer
from application import (
    config
)

async def main():
    log.info('init application')

    http_port = config.config['HTTP_PORT']
    base_path = config.config['BASE_PATH']
    
    # create HttpServer instance
    http_server = HttpServer(
        http_port=int(http_port), 
        base_path=base_path, 
        cors_origins=config.config['CORS_ORIGINS']
    )

    # register routers
    http_server.register_router(index_router)

    http_server.register_app()

    # function for opening connection, starting backgroun processes and etc
    async def on_start_handler():
        log.info('executing on_start_handler')

    # function for cleanup (closing TCP connection and etc)
    async def on_stop_handler():
        log.info('executing graceful shutdown')

    http_server.on_start(on_start_handler)
    http_server.on_stop(on_stop_handler)

    # start http server
    await http_server.start()

if __name__ == '__main__':
    # run in async environment
    asyncio.run(main())
