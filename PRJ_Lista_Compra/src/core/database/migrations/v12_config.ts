export async function up(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS config (
        id_config INTEGER PRIMARY KEY AUTOINCREMENT,
        id_tp_config INTEGER NOT NULL,
        url_config TEXT,
        port_config INTEGER,
        user_config TEXT,
        key_config TEXT, -- Chave de acesso/senha (Criptografado)
        vers_config TEXT,
        st_ssl INTEGER NOT NULL DEFAULT 1 CHECK (st_ssl IN (0, 1)),
        st_config INTEGER NOT NULL DEFAULT 1 CHECK (st_config IN (0, 1)),
        dt_config TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (id_tp_config) REFERENCES config_type (id_tp_config) ON DELETE RESTRICT
    );
    INSERT OR IGNORE INTO config (id_config, id_tp_config, url_config, port_config, user_config, key_config, st_ssl, st_config, dt_config)
        VALUES (1, 1, NULL, NULL, NULL, NULL, 1, 1, datetime('now', 'localtime'));
    `);
}