import { Container, SectionHeading, Reveal, Button } from '@/shared/ui'
import { useAsync } from '@/shared/hooks/useAsync'
import { formatBytes } from '@/shared/lib/format'
import { getPdfs, pdfDownloadUrl, pdfViewUrl } from '../api/home.api'
import styles from './Documents.module.css'

const COLORS = ['var(--rojo)', 'var(--teal)', 'var(--ocre)']

/** Documentos informativos. Datos: GET /api/home/pdfs */
export function Documents() {
  const { data, loading } = useAsync(getPdfs)
  const docs = data ?? []

  return (
    <section className={styles.sec} id="documentos">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Documentos informativos"
            title="Conoce más sobre nuestro trabajo"
            subtitle="Descarga o consulta en línea los documentos de la fundación."
          />
        </Reveal>
        {loading ? null : docs.length === 0 ? (
          <p className={styles.vacio}>Pronto publicaremos aquí los documentos de la fundación.</p>
        ) : (
          <div className={styles.grid}>
            {docs.map((d, i) => (
              <Reveal key={d.id} delay={0.08 * i}>
                <article className={styles.doc}>
                  <div className={styles.pdf} style={{ background: COLORS[i % COLORS.length] }}>PDF</div>
                  <h3>{d.titulo}</h3>
                  {d.descripcion && <p>{d.descripcion}</p>}
                  <span className={styles.meta}>{formatBytes(d.tamanoArchivo)}</span>
                  <div className={styles.acc}>
                    <Button href={pdfDownloadUrl(d.id)} variant="negro">Descargar</Button>
                    <Button href={pdfViewUrl(d.id)} variant="linea" target="_blank" rel="noopener noreferrer">Ver en línea</Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
