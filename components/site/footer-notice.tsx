/** The two closing lines of every footer. */
export function FooterNotice({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="type-legal">© 2026 Ruta Cripto Segura. Proyecto educativo independiente.</p>
      <p className="type-legal mt-1">
        Contenido educativo e informativo. No constituye asesoramiento financiero personalizado.
      </p>
    </div>
  )
}
