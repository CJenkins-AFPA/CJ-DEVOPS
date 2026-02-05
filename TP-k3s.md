# TP K3s

## État Vagrant et Configuration Initiale

Vagrant file + Script

```bash
vagrant status
```

**Current machine states:**

```text
nfs-storage               running (virtualbox)    inet 10.20.72.5/24
db-server                 running (virtualbox)    inet 10.20.72.6/24
k3s-manager               running (virtualbox)    inet 10.20.72.7/24
k3s-worker-1              running (virtualbox)    inet 10.20.72.8/24
k3s-worker-2              running (virtualbox)    inet 10.20.72.9/24
```

### Configuration `/etc/hosts`
k3s master + 2 workers: modifier `/etc/hosts` ajouter :

```text
127.0.0.1 localhost
10.20.72.7 k3s-manager
10.20.72.8 k3s-worker-1
10.20.72.9 k3s-worker-2
```

### Récupération du Token (Exemple)

```bash
NODE TOKEN
sudo cat /var/lib/rancher/k3s/server/node-token
# Exemple de sortie:
# K10a60019f860fa649e01c16bd24723fd1a526bd3b943683d8f22ec63c8dcbac6ad::server:2a6a6ec93fad3577d7f89924616b91ca
```

### Commandes de jonction (Exemples)

Pour le worker 10.20.72.8:
```bash
curl -sfL https://get.k3s.io | sudo K3S_URL="https://10.20.72.7:6443"  K3S_TOKEN="K10a60019f860fa649e01c16bd24723fd1a526bd3b943683d8f22ec63c8dcbac6ad::server:2a6a6ec93fad3577d7f89924616b91ca" sh -s - agent   --node-ip 10.20.72.8
```

Puis pour le worker 10.20.72.9:
```bash
curl -sfL https://get.k3s.io | sudo K3S_URL="https://10.20.72.7:6443"  K3S_TOKEN="K10a60019f860fa649e01c16bd24723fd1a526bd3b943683d8f22ec63c8dcbac6ad::server:2a6a6ec93fad3577d7f89924616b91ca" sh -s - agent   --node-ip 10.20.72.9
```

---

# TP COMPLET

## Configuration du Stockage NFS

Machine stockage NFS (pour y stocker des fichiers commun a +ieurs conteneurs).

**Storage NFS :**
*   OS : Debian 13
*   Disque dédié : `/dev/sdb` (vide)
*   Réseau k3s : `192.168.1.0/24`
*   Rôle : stockage NFS pour Kubernetes (RWX)

**Objectif :**
`/dev/sdb` formaté et monté sur `/srv/nfs`

### 1-1/ Partitionner sdb

```bash
lsblk
# Partitionner le disque
fdisk /dev/sdb
```

Séquence fdisk :
```text
n      # new
p      # primary
1      # partition 1
<ENTER>
<ENTER>
W
```

On doit voir `sdb1` via la commande `lsblk`.
On formate en ext4 :

```bash
mkfs.ext4 /dev/sdb1
```

### Script d'automatisation NFS

```bash
#!/bin/bash
set -euo pipefail
 
#############################################
# CONFIGURATION
#############################################
 
# Partition déjà existante (NE PAS FORMATER)
PARTITION="/dev/sdb1"
 
# Type de FS attendu
FS_TYPE="ext4"
 
# Point de montage
MOUNT_POINT="/srv/nfs"
 
# Réseau autorisé à monter les exports ( votre réseau vagrant ) 
ALLOWED_CIDR="10.20.72.0/24"
 
# Exports NFS à publier : "nom_logique:chemin_relatif"
EXPORTS=(
"wp-content:wp-content"
"backups:backups"
"shared:shared"
)
 
# Options NFS côté serveur
# no_root_squash utile pour Kubernetes sur un réseau de confiance (lab)
EXPORT_OPTIONS="rw,sync,no_subtree_check,no_root_squash"
 
# Gestion idempotente de /etc/exports
EXPORTS_FILE="/etc/exports"
EXPORTS_TAG="# managed-by-setup-nfs (noformat)"
 
#############################################
# OUTILS
#############################################
log()  { echo "[INFO]  $*"; }
warn() { echo "[WARN] $*" >&2; }
die()  { echo "[ERROR] $*" >&2; exit 1; }
 
require_root() {
 [[ "${EUID}" -eq 0 ]] || die "Ce script doit être exécuté en root"
}
 
pkg_install() {
 local pkg="$1"
 if ! dpkg -l | awk '{print $2}' | grep -qx "$pkg"; then
   log "Installation paquet: $pkg"
   apt update
   apt install -y "$pkg"
 else
   log "Paquet déjà installé: $pkg"
 fi
}
 
ensure_dir() {
 local d="$1"
 if [[ ! -d "$d" ]]; then
   log "Création du répertoire: $d"
   mkdir -p "$d"
 else
   log "Répertoire déjà présent: $d"
 fi
}
 
mount_is_active() {
 mountpoint -q "$MOUNT_POINT"
}
 
fstab_has_mountpoint() {
 awk 'NF && $1 !~ /^#/' /etc/fstab | awk '{print $2}' | grep -qx "$MOUNT_POINT"
}
 
fstab_remove_mountpoint() {
 local tmp
tmp="$(mktemp)"
 awk -v mnt="$MOUNT_POINT" '
   /^#/ { print; next }
   NF==0 { print; next }
   $2==mnt { next }
   { print }
 ' /etc/fstab > "$tmp"
 cat "$tmp" > /etc/fstab
 rm -f "$tmp"
}
 
validate_partition() {
 [[ -b "$PARTITION" ]] || die "Partition introuvable: $PARTITION"
 
 local fstype
 fstype="$(blkid -s TYPE -o value "$PARTITION" 2>/dev/null || true)"
 [[ -n "$fstype" ]] || die "Aucun FS détecté sur $PARTITION (blkid vide)."
 
 if [[ "$fstype" != "$FS_TYPE" ]]; then
   warn "FS détecté sur $PARTITION: $fstype (attendu: $FS_TYPE)"
   warn "Je continue quand même (tu peux corriger FS_TYPE si besoin)."
 else
   log "FS détecté: $fstype (OK)"
 fi
}
 
fstab_upsert() {
 local uuid
 uuid="$(blkid -s UUID -o value "$PARTITION" 2>/dev/null || true)"
 [[ -n "$uuid" ]] || die "Impossible de lire l'UUID de $PARTITION."
 
 local line="UUID=${uuid} ${MOUNT_POINT}  ${FS_TYPE}  defaults 0  2"
 
 if fstab_has_mountpoint; then
   log "Entrée fstab existante pour $MOUNT_POINT -> remplacement"
  fstab_remove_mountpoint
 else
   log "Aucune entrée fstab pour $MOUNT_POINT -> ajout"
 fi
 
 echo "$line" >> /etc/fstab
 
 # systemd peut cacher l'ancienne version
 systemctl daemon-reload
}
 
mount_partition() {
 ensure_dir "$MOUNT_POINT"
 
 if mount_is_active; then
   log "Déjà monté: $MOUNT_POINT"
   return 0
 fi
 
 log "Montage via fstab: $MOUNT_POINT"
 mount "$MOUNT_POINT" || die "Échec du montage sur $MOUNT_POINT (voir: dmesg | tail -n 50)"
}
 
setup_exports_dirs() {
 for entry in "${EXPORTS[@]}"; do
   IFS=":" read -r name relpath <<< "$entry"
   [[ -n "$name" && -n "$relpath" ]] || die "Entrée EXPORTS invalide: $entry"
   ensure_dir "${MOUNT_POINT}/${relpath}"
 done
}
 
ensure_exports_block() {
 [[ -f "$EXPORTS_FILE" ]] || touch "$EXPORTS_FILE"
 
 if ! grep -qF "${EXPORTS_TAG} - begin" "$EXPORTS_FILE"; then
   log "Ajout du bloc géré dans $EXPORTS_FILE"
   cat >> "$EXPORTS_FILE" <<EOF
 
${EXPORTS_TAG} - begin
${EXPORTS_TAG} - end
EOF
 fi
}
 
rewrite_exports_block() {
 log "Mise à jour idempotente du bloc exports"
 
 local tmp
tmp="$(mktemp)"
 
 # On conserve tout sauf l'intérieur du bloc géré
 awk -v begin="${EXPORTS_TAG} - begin" -v end="${EXPORTS_TAG} - end" '
   $0 == begin { print; inblock=1; next }
   $0 == end   { inblock=0; print; next }
   inblock==1  { next }
   { print }
 ' "$EXPORTS_FILE" > "$tmp"
 
 # Réécriture avec injection des exports juste après "begin"
 : > "$EXPORTS_FILE"
 while IFS= read -r line; do
   echo "$line" >> "$EXPORTS_FILE"
   if [[ "$line" == "${EXPORTS_TAG} - begin" ]]; then
     for entry in "${EXPORTS[@]}"; do
      IFS=":" read -r name relpath <<< "$entry"
       echo "${MOUNT_POINT}/${relpath} ${ALLOWED_CIDR}(${EXPORT_OPTIONS})" >> "$EXPORTS_FILE"
     done
   fi
 done < "$tmp"
 
 rm -f "$tmp"
}
 
apply_exports() {
 log "Application des exports"
 exportfs -ra
 exportfs -v
}
 
setup_nfs_service() {
 pkg_install "nfs-kernel-server"
 
 log "Activation/démarrage nfs-server"
 systemctl enable --now nfs-server
 
 log "Vérification écoute NFS (2049)"
 if ss -lntp | grep -E ':2049\b' >/dev/null; then
   log "NFS écoute sur 2049 (OK)"
 else
   warn "Port 2049 non détecté. Vérifie: systemctl status nfs-server / firewall"
 fi
}
 
#############################################
# MAIN
#############################################
require_root
 
log "Validation de la partition (sans formatage)"
validate_partition
 
log "Configuration fstab (idempotent)"
fstab_upsert
 
log "Montage du disque"
mount_partition
 
log "Création des dossiers exportés"
setup_exports_dirs
 
log "Installation + démarrage du serveur NFS"
setup_nfs_service
 
log "Configuration /etc/exports"
ensure_exports_block
rewrite_exports_block
apply_exports
 
log "Serveur NFS prêt."
log "Partition : ${PARTITION} (FS attendu: ${FS_TYPE})"
log "Montage   : ${MOUNT_POINT}"
log "Réseau    : ${ALLOWED_CIDR}"
for entry in "${EXPORTS[@]}"; do
 IFS=":" read -r name relpath <<< "$entry"
 log "Export    : ${MOUNT_POINT}/${relpath}"
done
```

### Commandes de contrôle

```bash
mount | grep /srv/nfs
exportfs -v
ss -lntp | grep 2049
```

### Tableau récapitulatif NFS

#### Paramètres globaux

| Élément | Valeur |
| :--- | :--- |
| Serveur NFS (VM) | `K3snfs` |
| IP serveur NFS | `10.20.72.5` |
| Point de montage du disque (serveur) | `/srv/nfs` (monté depuis `/dev/sdb1`) |
| Réseau autorisé | `10.20.72.0/24` |
| Port NFS | TCP 2049 |
| Version recommandée | NFSv4.1 (vers=4.1) |
| Options export (serveur) | `rw,sync,no_subtree_check,no_root_squash` |
| Options mount (clients) | `rw,sync,_netdev,hard,proto=tcp,vers=4.1,timeo=600,retrans=2` |

#### Exports NFS et montages clients

| Usage | Export NFS (serveur) | Cible NFS (client) | Point de montage (client) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **WordPress** – contenu persistant | `/srv/nfs/wp-content` | `10.20.72.5:/srv/nfs/wp-content` | `/mnt/wp-content` | RWX requis côté K8s (NFS OK). Pour pods : PV/PVC NFS. |
| **Backups** (dumps DB, archives) | `/srv/nfs/backups` | `10.20.72.5:/srv/nfs/backups` | `/mnt/backups` | Sert aux sauvegardes cluster/app (jobs, scripts). |
| **Partage commun** (optionnel) | `/srv/nfs/shared` | `10.20.72.5:/srv/nfs/shared` | `/mnt/shared` | Pour données partagées entre apps (à limiter en prod). |

#### Cibles Kubernetes (prévues)

| Élément Kubernetes | Export utilisé | Exemple de chemin monté dans le Pod | Remarque |
| :--- | :--- | :--- | :--- |
| PVC wp-content | `/srv/nfs/wp-content` | `/var/www/html/wp-content` | WordPress nécessite persistance (uploads/plugins/themes). |
| PVC backups | `/srv/nfs/backups` | `/backup` | Pour jobs de sauvegarde (cronjob). |

---

## Configuration du Cluster K3S

### Préparation du master k3s

*Modifier /etc/hosts ( ou dns )*

#### Désactiver le swap (obligatoire)

```bash
sudo swapoff -a
sudo sed -i.bak '/\sswap\s/s/^/#/' /etc/fstab
```

#### Modules kernel utiles

```bash
sudo tee /etc/modules-load.d/k8s.conf >/dev/null <<'EOF'
overlay
br_netfilter
EOF
 
sudo modprobe overlay
sudo modprobe br_netfilter
```

Pour vérifier :
```bash
lsmod | grep -E 'overlay|br_netfilter'
```

#### Sysctl réseau (forward + bridge)

```bash
sudo tee /etc/sysctl.d/99-kubernetes-cri.conf >/dev/null <<'EOF'
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
```

Pour vérifier :
```bash
sudo sysctl --system
```
**SUR TOUS LES MEMBRES MASTER ET WORKERS**

### Config Master

**Installer le master**

```bash
apt install sudo && apt install curl
```

> "Une image contenant texte, capture d’écran, Police, noir Le contenu généré par l’IA peut être incorrect."

```bash
curl -sfL https://get.k3s.io | sudo sh -s - server \
 --node-ip 10.20.72.7 \
 --advertise-address 10.20.72.7 \
 --tls-san 10.20.72.7 \
 --write-kubeconfig-mode 644
```

Vérifier : 
```bash
systemctl status k3s --no-pager
```

> "Une image contenant texte, capture d’écran, Police Le contenu généré par l’IA peut être incorrect."

```bash
kubectl get nodes -o wide
```

#### Récupération du token (sur le manager)
Il n’y a plus qu’à récupérer le token qui permettra de joindre les workers :
```bash
cat /var/lib/rancher/k3s/server/node-token
```

### Installation des Workers

#### Joindre les workers

Modifiez `/etc/hosts` comme pour le manager.
Et même config initiale :

```bash
swapoff -a
sed -i.bak '/\sswap\s/s/^/#/' /etc/fstab

tee /etc/modules-load.d/k8s.conf >/dev/null <<'EOF'
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

tee /etc/sysctl.d/99-kubernetes-cri.conf >/dev/null <<'EOF'
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

apt install curl sudo nfs-common
```

---

Puis pour le worker 10.20.72.8 :

```bash
curl -sfL https://get.k3s.io | sudo K3S_URL="https://10.20.72.7:6443"  K3S_TOKEN="K10a60019f860fa649e01c16bd24723fd1a526bd3b943683d8f22ec63c8dcbac6ad::server:2a6a6ec93fad3577d7f89924616b91ca" sh -s - agent   --node-ip 10.20.72.8
```

Idem pour le worker 10.20.72.9

Et on vérifie en retournant sur le manager : 
```bash
kubectl get nodes -o wide
```

---

## Les 3 FICHIERS CORE (Exemples)
*   **deployment** : décrire le conteneur
*   **service** : parler au cluster
*   **ingress** : accès extérieurs (genre de "reverse proxy")

### Déploiement NGINX
`nginx-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
 name: nginx
 labels:
   app: nginx
spec:
 replicas: 1
 selector:
   matchLabels:
     app: nginx
 template:
   metadata:
     labels:
       app: nginx
   spec:
     containers:
       - name: nginx
         image: nginx:1.25-alpine
         ports:
           - containerPort: 80
```

### Manifest Service (NodePort)
`nginx-svc-nodeport.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
 name: nginx-nodeport
spec:
 type: NodePort
 selector:
   app: nginx
 ports:
   - port: 80
     targetPort: 80
     nodePort: 30080
```

### Manifest Service (ClusterIP pour Ingress)
Pour l'exposition avec traefik, on crée un service ClusterIP.
`nginx-svc.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
 name: nginx
spec:
 type: ClusterIP
 selector:
   app: nginx
 ports:
   - port: 80
     targetPort: 80
```

### Manifest Ingress
Fichier d'ingress, qui exploite le service ClusterIP.
`nginx-ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
 name: nginx
spec:
 rules:
   - host: nginx.uyoop.lab
     http:
       paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: nginx
               port:
                number: 80
```

Comme d’hab, on applique :
```bash
kubectl apply -f nginx-ingress.yaml
```

---

## Correctif : Interface Flannel

### Dans le manager
`nano /etc/systemd/system/k3s.service`

Rajouter :
```text
'--flannel-iface' \
'eth1'
```

Puis redémarrer :
```bash
sudo systemctl daemon-reload
sudo systemctl restart k3s
```

### Dans les workers
`sudo nano /etc/systemd/system/k3s-agent.service`

Rajouter :
```text
'--flannel-iface' \
'eth1'
```

Puis redémarrer :
```bash
systemctl daemon-reload
systemctl restart k3s-agent
```
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

Services d'exposition:
>> Déclarer Application
- Cluster ip
- Node port
- Ingress

Séparation des variables d'environnement et secrets dans autre fichier que deploy.yaml
ConfigMap
• Stocke : variables d’environnement, fichiers de conf, paramètres applicatifs.
• Pas chiffré “par défaut” (c’est du texte encodé/stocké dans etcd).
• On l’utilise pour : WORDPRESS_DB_HOST, WORDPRESS_DB_NAME, options WordPress, etc.
Secret
• Stocke : password DB, clés, certificats, tokens.
• Encodé en base64 (ce n’est pas du chiffrement).
• En prod : tu ajoutes chiffrement au repos (EncryptionConfiguration) + RBAC strict + éventuellement External Secrets/Vault

CHECKER :
- contenerd
- namespace : si non spécifié = default. Lors d'une commande ,preciser -n namespace = exemple : kubectl get pods -n wordpress -o wide

K3s : RANCHER > Validé par kubernetes (google)
