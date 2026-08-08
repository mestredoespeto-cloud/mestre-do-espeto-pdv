import React from 'react'
import styles from '../styles/styles'

export default function LoginScreen({ nomeEntrada, setNomeEntrada, entrarNoSistema }) {
  return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <img src="/logo.png" alt="Mestre do Espeto" style={styles.logoSplash} />
        <h1 style={styles.title}>MESTRE DO ESPETO PRO</h1>
        <p>Digite seu nome para iniciar o atendimento.</p>

        <input
          autoFocus
          placeholder="Nome do atendente"
          value={nomeEntrada}
          onChange={e => setNomeEntrada(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') entrarNoSistema()
          }}
          style={styles.input}
        />

        <button onClick={entrarNoSistema} style={styles.green}>
          Entrar no sistema
        </button>
      </div>
    </div>
  )
}
