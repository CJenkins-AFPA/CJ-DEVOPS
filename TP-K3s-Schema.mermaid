flowchart TB
  %% === External ===
  Internet((Internet / Users)) --> DNS[DNS / Anycast]
  DNS --> LB[External Load Balancer\nPorts: 80/443]
  LB --> Ingress[Ingress Controller (Traefik/Nginx)\nPorts: 80/443]

  %% === Control Plane (HA) ===
  subgraph CP[Control Plane HA (k3s servers)]
    APIVIP[(API VIP / LB Internal)\nTCP 6443]
    S1[Server 1\nAPI Server + Scheduler + Controller]
    S2[Server 2\nAPI Server + Scheduler + Controller]
    S3[Server 3\nAPI Server + Scheduler + Controller]
    DB[(Datastore HA\netcd / MySQL / PostgreSQL)]

    APIVIP --> S1
    APIVIP --> S2
    APIVIP --> S3
    S1 --- DB
    S2 --- DB
    S3 --- DB
  end

  %% === Cluster Networking ===
  subgraph NET[Cluster Networking]
    PodCIDR[Pod CIDR: 10.42.0.0/16]
    SvcCIDR[Service CIDR: 10.43.0.0/16]
    NodeCIDR[Node CIDR: 192.168.10.0/24]
  end

  %% === Service Routing ===
  Ingress --> SVC[Service (ClusterIP/LB)\nPort: 80/443]
  SVC --> POD1[Pod A\n10.42.1.10]
  SVC --> POD2[Pod B\n10.42.2.10]

  %% === Worker Nodes ===
  subgraph W1[Worker Node 1\n192.168.10.11]
    POD1
    K1[kubelet\nPort: 10250]
    CNI1[CNI (Flannel/Cilium)\nVXLAN/EBPF]
    CRI1[containerd]
    POD1 --- K1
    POD1 --- CNI1
    POD1 --- CRI1
  end

  subgraph W2[Worker Node 2\n192.168.10.12]
    POD2
    K2[kubelet\nPort: 10250]
    CNI2[CNI (Flannel/Cilium)\nVXLAN/EBPF]
    CRI2[containerd]
    POD2 --- K2
    POD2 --- CNI2
    POD2 --- CRI2
  end

  %% === API Access ===
  W1 --> APIVIP
  W2 --> APIVIP

  %% === Storage ===
  POD1 --> PVC1[PVC]
  POD2 --> PVC2[PVC]
  PVC1 --> PV1[PV]
  PVC2 --> PV2[PV]
  PV1 --> Storage[(NFS / Ceph / Longhorn)]
  PV2 --> Storage

  %% === Observability ===
  subgraph OBS[Observability]
    METRICS[Prometheus / Metrics Server\nPort: 9090]
    LOGS[Loki / Fluentd\nPort: 3100]
    TRACES[Jaeger\nPort: 16686]
  end
  POD1 --> METRICS
  POD2 --> METRICS
  POD1 --> LOGS
  POD2 --> LOGS
  POD1 --> TRACES
  POD2 --> TRACES


  🧭 Légende (HA + Réseau)
Haute dispo (HA)

API VIP (TCP 6443) : point d’entrée unique vers le control plane.
3 serveurs k3s : redondance de l’API, du scheduler et du controller.
Datastore HA : etcd ou DB externe répliquée.
Réseau

Node CIDR : 192.168.10.0/24 (réseau machines).
Pod CIDR : 10.42.0.0/16 (IP internes pods).
Service CIDR : 10.43.0.0/16 (IPs virtuelles des services).
Ports clés :
80/443 : trafic entrant HTTP/HTTPS
6443 : API Kubernetes
10250 : kubelet
9090 / 3100 / 16686 : observabilité
