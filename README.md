# oa-stories

https://oa-stories.herokuapp.com/

## Local Development

`pipenv install --dev` is a great place to start.

Include `FLASK_ENV=development` in a `.env` file.

`pipenv run python app.py` will run the app locally and will use the cached data (ths json files in `static`). These same files are used in production.
