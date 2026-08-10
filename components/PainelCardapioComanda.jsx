import React, { useEffect, useMemo, useState } from 'react'
import styles from '../styles/styles'

const nomeCurtoCategoria = (categoria) => {
  const mapa = {
    Espetos: '🍢 Espetos Tradicionais',
    'Espetos Premium Avulso': '⭐ Espetos Premium',
    Executivos: '🍽️ Monte seu Prato',
    Adicionais: '➕ Adicionais',
    Bebidas: '🥤 Bebidas',
    Porções: '🍟 Porções',
    'Lanche no Espeto': '🥖 Lanche',
    Combos: '🎁 Combos'
  }

  return mapa[categoria] || categoria
}

export default function PainelCardapioComanda({
  cardapio,
  estoque,
  adicionarItem,
  abrirSelecaoExecutivo,
  abrirSelecaoCombo,
  abrirSelecaoLanche
}) {
  const categorias = useMemo(() => Object.keys(cardapio || {}), [cardapio])
  const [categoriaAtiva, setCategoriaAtiva] = useState(categorias[0] || '')

  useEffect(() => {
    if (!categoriaAtiva || !categorias.includes(categoriaAtiva)) {
      setCategoriaAtiva(categorias[0] || '')
    }
  }, [categorias, categoriaAtiva])

  const itens = categoriaAtiva ? (cardapio[categoriaAtiva] || []) : []

  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 12
        }}
      >
        {categorias.map(cat => {
          const ativa = cat === categoriaAtiva

          return (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              style={{
                minWidth: 145,
                padding: '12px 14px',
                borderRadius: 10,
                border: ativa ? '2px solid #ffb300' : '1px solid #555',
                background: ativa ? '#3b2600' : '#2b2b2b',
                color: ativa ? '#ffd166' : '#fff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {nomeCurtoCategoria(cat)}
            </button>
          )
        })}
      </div>

      {categoriaAtiva && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 10
            }}
          >
            <h3 style={{ margin: 0 }}>{categoriaAtiva}</h3>
            <small style={{ color: '#bbb' }}>{itens.length} itens</small>
          </div>

          <div style={styles.grid}>
            {itens.map(item => {
              const nomeEstoque = item.estoqueNome || item.nome
              const saldo = Number(estoque?.[nomeEstoque] ?? 0)
              const semEstoque = saldo <= 0
              const estoqueBaixo = saldo > 0 && saldo <= 5
              const ehExecutivo = categoriaAtiva === 'Executivos'

              return (
                <button
                  key={item.id || item.nome}
                  onClick={() => {
                    if (ehExecutivo) return abrirSelecaoExecutivo(item)
                    if (categoriaAtiva === 'Combos') return abrirSelecaoCombo(item)
                    if (categoriaAtiva === 'Lanche no Espeto') return abrirSelecaoLanche(item)
                    return adicionarItem(item, categoriaAtiva)
                  }}
                  disabled={!ehExecutivo && categoriaAtiva !== 'Combos' && categoriaAtiva !== 'Lanche no Espeto' && semEstoque}
                  style={{
                    ...(ehExecutivo ? styles.execBtn : styles.itemBtn),
                    opacity: !ehExecutivo && categoriaAtiva !== 'Combos' && categoriaAtiva !== 'Lanche no Espeto' && semEstoque ? 0.45 : 1,
                    cursor: !ehExecutivo && categoriaAtiva !== 'Combos' && categoriaAtiva !== 'Lanche no Espeto' && semEstoque ? 'not-allowed' : 'pointer'
                  }}
                >
                  <strong>{item.nome}</strong>
                  <br />
                  R$ {Number(item.preco ?? 0).toFixed(2)}

                  {!ehExecutivo && categoriaAtiva !== 'Combos' && categoriaAtiva !== 'Lanche no Espeto' && (
                    <small
                      style={{
                        display: 'block',
                        marginTop: 6,
                        color: semEstoque
                          ? '#ff5252'
                          : estoqueBaixo
                            ? '#ffb300'
                            : '#a5d6a7'
                      }}
                    >
                      {semEstoque
                        ? 'SEM ESTOQUE'
                        : estoqueBaixo
                          ? `⚠ Estoque: ${saldo}`
                          : `Estoque: ${saldo}`}
                    </small>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
