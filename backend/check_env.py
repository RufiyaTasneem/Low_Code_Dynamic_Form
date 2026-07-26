import os
from dotenv import load_dotenv
print('DOTENV_loaded', load_dotenv())
print('DATABASE_URL env', repr(os.getenv('DATABASE_URL')))
try:
    from app.config.database import engine
    print('engine', engine)
    print('engine url', engine.url)
except Exception as e:
    print('ERROR', type(e).__name__, str(e))
    import traceback
    traceback.print_exc()
