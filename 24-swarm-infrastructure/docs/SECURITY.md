# Sécurité

- Certificats self-signed : prévoir ajout de la CA sur postes/VMs.
- Harbor : utiliser des mots de passe forts, limiter les projets.
- MariaDB externe : firewall n'ouvre que 3306 depuis Manager/Workers.
- Secrets : injecter via Docker secrets ou variables d'environnement sécurisées.
