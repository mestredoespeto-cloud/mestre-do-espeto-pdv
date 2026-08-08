import React from 'react'
import styles from '../styles/styles'

export default function HeaderBar({
  atendente,
  adminLiberado,
  trocarAtendente,
  liberarAdministrador,
  bloquearAdministrador
}) {
  return (
    <>
      <div style={styles.logoBox}>
        <img src="/logo.png" alt="Mestre do Espeto" style={styles.logo} />
        <h1 style={styles.title}>MESTRE DO ESPETO — PDV ONLINE</h1>
        <p style={{ color: '#00c853' }}>🟢 Sincronizado em tempo real</p>
      </div>

      <div style={styles.card}>
        <div style={styles.topBar}>
          <div>
            <strong>Atendente atual</strong>
            <div style={styles.atendenteNome}>👤 {atendente}</div>
            <div style={{ marginTop: 5 }}>
              Modo: {adminLiberado ? 'Administrador' : 'Atendimento'}
            </div>
          </div>

          <div style={styles.topActions}>
            <button onClick={trocarAtendente} style={styles.smallBtn}>
              🚪 Trocar atendente
            </button>

            {!adminLiberado ? (
              <button onClick={liberarAdministrador} style={styles.yellowSmall}>
                🔐 Administração
              </button>
            ) : (
              <button onClick={bloquearAdministrador} style={styles.redSmall}>
                🔒 Sair da administração
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
