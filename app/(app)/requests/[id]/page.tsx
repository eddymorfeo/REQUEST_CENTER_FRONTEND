export default function RequestDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Detalle de Solicitud</h1>
      <p className="text-sm text-muted-foreground mt-1">ID: {params.id}</p>

      {/* Siguiente paso: fetch detalle + comentarios + adjuntos */}
    </div>
  );
}
