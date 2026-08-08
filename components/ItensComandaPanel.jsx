import React, { useMemo } from 'react'
import styles from '../styles/styles'

export default function ItensComandaPanel({
  comandaAtual,
  cardapio,
  adminLiberado,
  custoProduto,
  adicionarItem,
  removerItem,
  abrirSelecaoExecutivo
}) {
  const itens = comandaAtual?.itens || []
  const tipoAtual = comandaAtual?.tipoComanda || 'Cliente'

  const linhas = useMemo(() => {
    const agrupados = []
    const mapa = new Map()

    itens.forEach((item, index) => {
      // Executivos permanecem separados porque podem ter espetos diferentes.
      if (item.tipo === 'executivo') {
        agrupados.push({
          chave: `executivo-${index}`,
          item,
          qtd: 1,
          indices: [index],
          executivo: true
        })
        return
      }

      const chave = [
        item.nome,
        item.categoria || '',
        item.estoqueNome || ''
      ].join('|')

      if (!mapa.has(chave)) {
        const linha = {
          chave,
          item,
          qtd: 0,
          indices: [],
          executivo: false
        }
        mapa.set(chave, linha)
        agrupados.push(linha)
      }

      const linha = mapa.get(chave)
      linha.qtd += 1
      linha.indices.push(index)
    })

    return agrupados
  }, [itens])

  const localizarProdutoCardapio = (item) => {
    const categoria = item.categoria || ''
    const listaCategoria = cardapio?.[categoria] || []

    return (
      listaCategoria.find(prod =>
        prod.nome === item.nome ||
        (prod.estoqueNome || prod.nome) === (item.estoqueNome || item.nome)
      ) ||
      Object.values(cardapio || {})
        .flat()
        .find(prod =>
          prod.nome === item.nome ||
          (prod.estoqueNome || prod.nome) === (item.estoqueNome || item.nome)
        )
    )
  }

  const aumentar = (linha) => {
    if (linha.executivo) {
      const produto = localizarProdutoCardapio(linha.item)

      if (produto) {
        abrirSelecaoExecutivo(produto)
      } else {
        alert('Não foi possível localizar este executivo no cardápio.')
      }
      return
    }

    const produto = localizarProdutoCardapio(linha.item)

    if (!produto) {
      alert('Não foi possível localizar este produto no cardápio.')
      return
    }

    adicionarItem(produto, linha.item.categoria)
  }

  const diminuir = (linha) => {
    const indice = linha.indices[linha.indices.length - 1]
    if (indice === undefined) return
    removerItem(indice)
  }

  if (!itens.length) {
    return (
      <div style={{ ...styles.box, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>🛒 Itens da Comanda</h2>
        <p style={{ marginBottom: 0, color: '#bbb' }}>
          Nenhum item lançado ainda.
        </p>
      </div>
    )
  }

  return (
    <div style={{ ...styles.box, marginTop: 18 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12
        }}
      >
        <h2 style={{ margin: 0 }}>🛒 Itens da Comanda</h2>
        <strong>{itens.length} un.</strong>
      </div>

      {linhas.map(linha => {
        const item = linha.item
        const valorUnitario = Number(item.precoVenda ?? item.preco ?? 0)
        const subtotal = valorUnitario * linha.qtd
        const nomeEstoque = item.estoqueNome || item.nome
        const custoUnitario = Number(custoProduto(nomeEstoque) || 0)

        return (
          <div
            key={linha.chave}
            style={{
              background: '#222',
              border: '1px solid #444',
              borderRadius: 10,
              padding: 12,
              marginBottom: 9
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start'
              }}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 16 }}>{item.nome}</strong>

                <div style={{ marginTop: 5, color: '#ddd' }}>
                  {linha.qtd} x R$ {valorUnitario.toFixed(2)}
                  {linha.qtd > 1 && (
                    <strong> = R$ {subtotal.toFixed(2)}</strong>
                  )}
                </div>

                {adminLiberado && tipoAtual !== 'Cliente' && (
                  <small style={{ display: 'block', marginTop: 5, color: '#ffd166' }}>
                    Custo unitário: R$ {custoUnitario.toFixed(2)}
                  </small>
                )}

                {linha.executivo && (
                  <small style={{ display: 'block', marginTop: 6, color: '#bbb' }}>
                    Espetos: {(item.espetosInclusos || []).join(', ')}
                  </small>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  flexShrink: 0
                }}
              >
                <button
                  onClick={() => diminuir(linha)}
                  title="Remover uma unidade"
                  style={{
                    width: 38,
                    height: 38,
                    border: 'none',
                    borderRadius: 8,
                    background: '#d50000',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 20,
                    cursor: 'pointer'
                  }}
                >
                  −
                </button>

                <div
                  style={{
                    minWidth: 34,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 17
                  }}
                >
                  {linha.qtd}
                </div>

                <button
                  onClick={() => aumentar(linha)}
                  title={linha.executivo ? 'Adicionar outro executivo' : 'Adicionar uma unidade'}
                  style={{
                    width: 38,
                    height: 38,
                    border: 'none',
                    borderRadius: 8,
                    background: '#00c853',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 20,
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
