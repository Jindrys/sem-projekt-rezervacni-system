# Rezervační systém

REST API pro správu rezervací místností.

---

## Doména a business pravidla

Entity: **User**, **Room**, **Reservation** (User 1:N Reservation N:1 Room)

1. Rezervaci nelze vytvořit na obsazený časový slot
2. Rezervaci nelze zrušit méně než 1 hodinu před začátkem
3. Rezervaci může zrušit pouze vlastník nebo admin
4. Délka rezervace nesmí přesáhnout 4 hodiny
5. Rezervace lze vytvářet pouze do budoucnosti

---

## Architektura
```
Klient
  │
  ▼
Controller    ← HTTP request/response, status kódy
  │
  ▼
Service       ← business logika, volá domain rules
  │
  ▼
Domain        ← čistá logika bez externích závislostí
  │
  ▼
Sequelize     ← ORM vrstva
  │
  ▼
PostgreSQL
```

---

## Spuštění lokálně
```bash
git clone https://github.com/TVOJE_JMENO/sem-projekt-rezervacni-system.git
cd sem-projekt-rezervacni-system
npm install
cp .env.example .env
docker-compose up -d db db_test
npm run dev
```

API běží na `http://localhost:3000`

### Testy
```bash
npm run test:unit          # unit testy
npm run test:integration   # integrační testy (vyžaduje db_test)
npm run test:coverage      # coverage report
```

---

## Testovací strategie

**Unit testy** (`tests/unit/`) – testují izolovanou doménovou logiku bez databáze, vzor AAA, vznikaly před implementací (TDD red → green → refactor)

**Integrační testy** (`tests/integration/`) – testují celý stack HTTP → controller → service → PostgreSQL, každý test začíná s čistou databází

**Mocking** – `notificationService` je mockován pomocí `jest.mock()` protože jde o externí závislost. Čas je injektován jako parametr do funkcí místo `Date.now()` pro deterministické testy.

**Coverage** – měřeno pomocí `c8`, cíl ≥ 70 % line, ≥ 50 % branch

---

## Nasazení do Kubernetes (minikube)
```bash
minikube start
minikube addons enable ingress
docker build -t reservation-system:latest .
minikube image load reservation-system:latest
kubectl apply -f k8s/
kubectl get pods -n staging
kubectl port-forward service/reservation-service 3000:80 -n staging
```

### Prostředí

| Prostředí | Namespace | NODE_ENV |
|-----------|-----------|----------|
| Staging | staging | staging |
| Production | production | production |

Konfigurace je oddělena v `ConfigMap`, hesla v `Secret` (base64, nikdy plaintext v repozitáři).