.PHONY: help up down clean logs shell-backend shell-frontend

help:
	@echo "uHub Makefile"
	@echo "-------------"
	@echo "make up     : Build and start the stack (detached)"
	@echo "make down   : Stop and remove containers"
	@echo "make clean  : Stop and remove containers AND volumes (Full Reset)"
	@echo "make logs   : View logs"
	@echo "make shell-backend : Open shell in backend container"

up:
	docker compose up --build -d

down:
	docker compose down

clean:
	docker compose down -v
	@echo "Volumes removed. Database is reset."

logs:
	docker compose logs -f

shell-backend:
	docker compose exec backend /bin/bash
