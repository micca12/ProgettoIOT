# Progetti IoT - Laboratorio Sistemi Embedded e IoT

Repository con le idee progettuali per il corso di Sistemi Embedded e IoT.

---

## 🌟 Progetti Selezionati

### 1. Sistema di Irrigazione Intelligente ⭐⭐⭐⭐⭐

**Descrizione:**
Sistema automatizzato per la gestione intelligente dell'irrigazione di giardini e campi agricoli.

**Componenti principali:**
- Sensori di umidità del suolo distribuiti in diverse zone
- Sensore pioggia per rilevamento precipitazioni
- Integrazione API meteo per previsioni
- Elettrovalvole controllate automaticamente
- Dashboard web con mappa zone irrigate
- Sistema di logging e storico consumo acqua

**Funzionalità chiave:**
- Irrigazione automatica basata su umidità suolo
- Ottimizzazione consumo idrico
- Prevenzione irrigazione durante pioggia
- Pianificazione irrigazione basata su previsioni meteo
- Visualizzazione consumi e statistiche
- Alert per anomalie (perdite, sensori guasti)

**Tecnologie suggerite:**
- **Hardware:** ESP32, sensori capacitivi umidità, sensore pioggia, relè per elettrovalvole
- **Protocollo:** MQTT
- **Backend:** Node.js/Python
- **Frontend:** React con mappe interattive (Leaflet/Google Maps)
- **Database:** InfluxDB per time-series

**Complessità:** Media-Alta

---

### 2. Smart Locker / Armadietti Intelligenti ⭐⭐⭐⭐⭐

**Descrizione:**
Sistema di gestione intelligente per armadietti in palestre, uffici o università con assegnazione automatica e tracking occupazione.

**Workflow utente:**
1. **Check-in:** L'utente passa il tesserino al lettore RFID/NFC
2. **Assegnazione:** Il sistema assegna automaticamente un armadietto libero e genera un QR code univoco
3. **Accesso:** L'utente può aprire l'armadietto tramite QR code o PIN
4. **Check-out:** Al passaggio del tesserino in uscita, l'armadietto viene liberato e disaccoppiato dall'account

**Componenti principali:**
- Lettore RFID/NFC per tesserini utenti
- Serrature elettroniche per armadietti
- Sistema generazione QR code dinamici
- Display per visualizzazione QR code e PIN
- Server centrale per gestione assegnazioni

**Funzionalità:**

**Lato Utente:**
- Visualizzazione armadietto assegnato
- QR code personale per apertura
- Storico utilizzi
- **Occupazione palestra real-time** (basata su armadietti occupati con rapporto 1:1)

**Lato Amministratore:**
- Dashboard stato armadietti (libero/occupato/manutenzione)
- Gestione utenti e permessi
- Sistema di prenotazione armadietti
- Log accessi e utilizzo
- Alert timeout (armadietti occupati troppo a lungo)
- Gestione emergenze (apertura forzata)

**Tecnologie suggerite:**
- **Hardware:** ESP32, lettori RFID RC522, serrature elettroniche, display OLED
- **Protocollo:** MQTT + REST API
- **Backend:** Node.js/Express o Python/FastAPI
- **Frontend:** React/Vue.js
- **Database:** PostgreSQL/MongoDB
- **QR Generation:** qrcode.js / Python qrcode library

**Complessità:** Media

---

### 3. Monitoraggio Qualità Aria Indoor ⭐⭐⭐⭐⭐

**Descrizione:**
Sistema di monitoraggio ambientale per spazi chiusi, particolarmente rilevante in contesti post-COVID per garantire ambienti salubri.

**Componenti principali:**
- Sensori CO2 (MH-Z19 o equivalenti)
- Sensori particolato PM2.5/PM10
- Sensori VOC (composti organici volatili)
- Sensori temperatura e umidità (DHT22/BME280)
- Multiple unità distribuite negli ambienti

**Funzionalità chiave:**
- Monitoraggio real-time qualità aria
- Sistema alert multilivello:
  - Verde: aria salubre
  - Giallo: attenzione, ventilare presto
  - Rosso: intervento immediato necessario
- Suggerimenti automatici contestuali:
  - "Aprire finestre per 10 minuti"
  - "Attivare sistema ventilazione meccanica"
  - "Ridurre numero persone nella stanza"
- Heatmap degli ambienti monitorati
- Grafici storici per ogni parametro
- Confronto tra ambienti
- Export dati per analisi

**Dashboard features:**
- Visualizzazione multi-ambiente in tempo reale
- Mappa termica edificio
- Trend giornalieri/settimanali/mensili
- Classificazione ambienti per qualità aria
- Notifiche push/email per alert

**Tecnologie suggerite:**
- **Hardware:** ESP32, MH-Z19B (CO2), PMS5003 (PM), SGP30 (VOC), BME280
- **Protocollo:** MQTT
- **Backend:** Python/FastAPI con Celery per elaborazione dati
- **Frontend:** React con D3.js/Chart.js per grafici
- **Database:** InfluxDB + PostgreSQL
- **Notifiche:** Telegram Bot API / Email

**Complessità:** Media-Alta

---

### 4. Sistema di Monitoraggio Serra/Coltivazione Indoor ⭐⭐⭐⭐

**Descrizione:**
Sistema completo per il controllo e monitoraggio di serre o coltivazioni indoor con automazione e analisi crescita.

**Parametri monitorati:**
- Temperatura aria e suolo
- Umidità aria e suolo
- Intensità luminosa (PAR - Photosynthetically Active Radiation)
- pH del terreno/soluzione nutritiva
- Livello acqua serbatoio
- Conducibilità elettrica (EC) soluzione nutritiva

**Componenti principali:**
- Sensori multiparametrici
- Sistema illuminazione controllato (LED grow lights)
- Pompe irrigazione automatiche
- Ventilazione controllata
- Camera per timelapse e monitoraggio visivo
- Sistema dosaggio nutrienti (opzionale)

**Funzionalità chiave:**
- **Automazione completa:**
  - Irrigazione basata su umidità suolo
  - Controllo ciclo luce (fotoperiodo)
  - Regolazione temperatura/ventilazione
  - Dosaggio automatico fertilizzanti

- **Monitoraggio visivo:**
  - Timelapse crescita piante
  - Riconoscimento immagini per problemi (ML)
  - Alert malattie/parassiti via analisi foto

- **Tracciabilità:**
  - Profilo completo ogni pianta
  - Storico trattamenti e interventi
  - Correlazione parametri-crescita
  - Ciclo produttivo dall'inizio alla raccolta

- **Dashboard:**
  - Vista real-time tutti i parametri
  - Grafici crescita nel tempo
  - Confronto cicli produttivi
  - Ricette colturali pre-impostate
  - Alert e raccomandazioni

**Tecnologie suggerite:**
- **Hardware:** ESP32, sensori multipli, relè, pompe peristaltiche, camera ESP32-CAM
- **Protocollo:** MQTT
- **Backend:** Python/FastAPI + TensorFlow Lite per image recognition
- **Frontend:** React con visualizzazioni real-time
- **Database:** InfluxDB + MongoDB (immagini)
- **ML:** TensorFlow/PyTorch per detection problemi
- **Timelapse:** FFmpeg per generazione video

**Complessità:** Alta

**Note:** Progetto molto interessante ma richiede implementazione accurata. Con la giusta dedizione può risultare eccellente.

---

### 5. Smart Waste Management (Cestini Intelligenti) ⭐⭐⭐

**Descrizione:**
Sistema di gestione intelligente dei rifiuti con monitoraggio riempimento e ottimizzazione raccolta.

**Componenti principali:**
- Sensori ultrasuoni per misurazione livello riempimento
- Cestini multipli per raccolta differenziata:
  - Plastica
  - Carta
  - Organico
  - Indifferenziato
- Sistema di identificazione utente (opzionale)
- GPS per localizzazione cestini

**Funzionalità chiave:**
- **Monitoraggio:**
  - Livello riempimento real-time
  - Temperatura (per rilevare combustioni)
  - Predizione quando sarà pieno

- **Ottimizzazione raccolta:**
  - Mappa cestini con priorità svuotamento
  - Algoritmo percorso ottimale operatori
  - Alert quando cestino supera soglia (es. 80%)
  - Statistiche tempo medio riempimento

- **Dashboard operatori:**
  - Mappa interattiva con stato cestini
  - Lista priorità interventi
  - Percorso ottimizzato giornaliero
  - Storico svuotamenti

- **Gamification per utenti:**
  - Punti per riciclo corretto
  - Classifiche settimanali/mensili
  - Badge e achievement
  - Premi/sconti per top riciclatori

- **Analytics:**
  - Statistiche riciclo per zona
  - Trend produzione rifiuti
  - Efficacia campagne sensibilizzazione
  - Report sostenibilità

**Tecnologie suggerite:**
- **Hardware:** ESP32, sensori ultrasuoni HC-SR04, sensore temperatura, GPS
- **Protocollo:** MQTT + LoRaWAN (per cestini distanti)
- **Backend:** Node.js/Python
- **Frontend:** React con mappe (Leaflet)
- **Database:** PostgreSQL + PostGIS
- **Routing:** OpenRouteService API / GraphHopper

**Complessità:** Media

**Note:** Progetto interessante, da valutare bene l'implementazione della parte gamification.

---

### 6. Sistema Anti-Spreco Alimentare per Mense/Ristoranti ⭐⭐

**Descrizione:**
Sistema per monitorare e ridurre gli sprechi alimentari in contesti di ristorazione collettiva.

**Componenti principali:**
- Bilance intelligenti per pesatura scarti
- Sistema categorizzazione (manuale o con camera)
- Tablet/interfaccia per operatori
- Dashboard analytics

**Funzionalità chiave:**
- Pesatura automatica scarti per tipologia:
  - Cibo preparato non servito
  - Cibo servito ma non consumato
  - Scarti di preparazione
  - Categorie alimentari (carne, verdure, carboidrati, etc.)

- **Analytics e insights:**
  - Dashboard con statistiche spreco
  - Trend giornalieri/settimanali
  - Correlazione menu-spreco
  - Identificazione piatti problematici
  - Confronto con obiettivi sostenibilità

- **Suggerimenti automatici:**
  - Riduzione porzioni piatti molto scartati
  - Modifiche menu basate su dati
  - Previsioni quantità da preparare
  - Alert sprechi anomali

- **Reporting:**
  - Report periodici per management
  - Calcolo costi spreco
  - Impact ambientale (CO2, acqua risparmiata)
  - Confronto con standard settore

**Tecnologie suggerite:**
- **Hardware:** Bilance digitali con interfaccia, tablet per input
- **Protocollo:** REST API / MQTT
- **Backend:** Python/FastAPI
- **Frontend:** React/Vue.js
- **Database:** PostgreSQL
- **Analytics:** Pandas, scikit-learn per predizioni

**Complessità:** Media-Bassa

---

### 7. Sistema di Tracciamento Risorse Aziendali ⭐⭐

**Descrizione:**
Sistema per tracciare la posizione e l'utilizzo di attrezzature aziendali mobili.

**Componenti principali:**
- Tag RFID passivi o beacon BLE su attrezzature
- Lettori RFID/BLE distribuiti negli edifici
- Database inventario
- Sistema prenotazione

**Attrezzature tracciabili:**
- Laptop
- Proiettori
- Strumenti tecnici
- Carrelli
- Attrezzature mediche (in ospedali)

**Funzionalità chiave:**
- **Localizzazione:**
  - Posizione real-time approssimativa
  - Ultimo lettore che ha rilevato il dispositivo
  - Heatmap utilizzo spazi

- **Prenotazione:**
  - Sistema booking attrezzature
  - Calendar integration
  - Notifiche disponibilità
  - Check-in/check-out

- **Manutenzione:**
  - Storico utilizzo
  - Pianificazione manutenzione programmata
  - Alert scadenze
  - Tracciamento costi

- **Analytics:**
  - Tasso utilizzo per risorsa
  - Tempo medio utilizzo
  - Risorse sottoutilizzate
  - Necessità nuovi acquisti

**Tecnologie suggerite:**
- **Hardware:** Tag RFID/BLE, lettori strategici
- **Protocollo:** MQTT / REST
- **Backend:** Node.js/Java Spring
- **Frontend:** React
- **Database:** PostgreSQL
- **BLE:** Estimote SDK / Nordic nRF

**Complessità:** Media

**Note:** Progetto interessante ma da valutare disponibilità hardware RFID/BLE.

---

### 8. Sistema di Monitoraggio Consumi Energetici ⭐⭐⭐

**Descrizione:**
Sistema per monitorare e ottimizzare i consumi energetici di edifici o abitazioni.

**Componenti principali:**
- Sensori corrente/potenza (es. PZEM-004T)
- Pinze amperometriche non invasive
- Installazione su quadri elettrici
- Misurazioni per singole utenze o gruppi

**Parametri monitorati:**
- Potenza istantanea (W)
- Energia consumata (kWh)
- Tensione
- Corrente
- Fattore di potenza
- Frequenza

**Funzionalità chiave:**
- **Monitoraggio real-time:**
  - Dashboard consumi live
  - Breakdown per utenza/stanza
  - Confronto con periodi precedenti
  - Costo stimato in tempo reale

- **Rilevamento anomalie:**
  - Consumi anomali (picchi inattesi)
  - Dispositivi sempre accesi
  - Dispersioni elettriche
  - Alert consumi oltre soglia

- **Analytics e insights:**
  - Grafici consumi giornalieri/mensili/annuali
  - Identificazione energy vampires
  - Correlazione consumi-temperatura
  - Previsione spesa bolletta

- **Suggerimenti risparmio:**
  - Raccomandazioni personalizzate
  - Calcolo ROI interventi efficientamento
  - Confronto con case simili
  - Classificazione energetica ambienti

- **Automazione (opzionale):**
  - Spegnimento automatico dispositivi
  - Scheduling carico-scarico
  - Ottimizzazione fascia oraria

**Tecnologie suggerite:**
- **Hardware:** ESP32, PZEM-004T, pinze amperometriche SCT-013
- **Protocollo:** MQTT
- **Backend:** Python/FastAPI
- **Frontend:** React con grafici real-time
- **Database:** InfluxDB
- **Analytics:** Pandas, Prophet per forecasting

**Complessità:** Media-Alta

**Note:** Tema della sostenibilità molto attuale, dati interessanti da analizzare.

---





## 🛠️ Stack Tecnologico Consigliato (generale)

### Hardware
- **Microcontrollori:** ESP32 (WiFi + BLE) o ESP8266
- **Protocolli comunicazione:** MQTT (leggero, adatto IoT)

### Backend
- **Linguaggio:** Python (FastAPI) o Node.js (Express)
- **Message Broker:** Mosquitto (MQTT broker)
- **Database Time-Series:** InfluxDB
- **Database Relazionale:** PostgreSQL
- **Cache:** Redis (opzionale)

### Frontend
- **Framework:** React o Vue.js
- **Grafici:** Chart.js, D3.js, o Recharts
- **Mappe:** Leaflet o Google Maps API
- **UI Library:** Material-UI, Ant Design, o Tailwind CSS

### DevOps
- **Containerizzazione:** Docker + Docker Compose
- **Version Control:** Git + GitHub/GitLab
- **CI/CD:** GitHub Actions (opzionale)

### Testing
- **Backend:** Pytest (Python) o Jest (Node.js)
- **Frontend:** Jest + React Testing Library
- **E2E:** Cypress (opzionale)





**Corso:** Laboratorio di Sistemi Embedded e IoT  

---

*Good luck con il progetto! 🚀*
