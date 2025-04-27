# KefaiHub - TFM Macià Estela

Aquest repositori conté el codi font del projecte **KefaiHub**, desenvolupat com a Treball de Fi de Màster de Desenvolupament de Llocs i Aplicacions Web.

El projecte està dividit en dos grans components:
- **Backend**: Desenvolupat sobre la plataforma **Liferay 7.4 CE GA132**.
- **Frontend**: Aplicació desenvolupada amb **Angular 17.3.0**.

---

## Requeriments del sistema

Per poder executar el projecte, cal disposar dels següents components instal·lats:

- **Sistema Operatiu**: Windows 10
- **Java**: Java JDK 11
- **Apache Tomcat**: 9.0.65 (per desplegar Liferay)
- **Liferay**: Community Edition Portal 7.4.3.132 CE GA132
- **Node.js**: v21.3.0 (per Angular)
- **MySQL**: 8.0.31 (base de dades del portal)

---

## Instruccions d'instal·lació

### Backend (Liferay + Base de dades)

1. **Assegurar-se de tenir Java JDK 11 instal·lat** i configurar la variable d'entorn `JAVA_HOME`.
2. **Instal·lar MySQL 8.0.31**.
3. **Restaurar la base de dades**:

   - Crear una base de dades buida:
     ```sql
     CREATE DATABASE kefaihub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```

   - Importar el fitxer de dump:
     ```bash
     mysql -u root -p kefaihub < /backup-mysql/dump-kefaihub.sql
     ```

4. **Accedir al directori** `liferay-portal/`.
5. **Configurar la connexió de base de dades** al fitxer  `liferay-ext.properties`
5. **Iniciar Liferay** executant el servidor Tomcat dins `liferay-portal/tomcat/bin/startup.bat`

### Frontend (Angular)

1. **Accedir al directori** `kefaihub-angular/` (ja inclòs al repositori).
2. **Instal·lar dependències**
    ```bash
    npm install
    ```
3. **Arrancar el frontend**
    ```bash
    ng serve
    ```