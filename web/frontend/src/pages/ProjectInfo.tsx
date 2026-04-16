export default function ProjectInfo() {
    return (
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-8">
          <h1 className="text-4xl font-bold">Proyecto</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Información general sobre la idea, el enfoque y la finalidad de HydrIA.
          </p>
        </section>
  
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-5">
            <h2 className="text-xl font-semibold">Consulta pública</h2>
            <p className="mt-3 text-slate-300">
              La web está pensada para que cualquier usuario pueda consultar el
              estado del sistema sin necesidad de registrarse.
            </p>
          </div>
  
          <div className="rounded-2xl bg-white/5 p-5">
            <h2 className="text-xl font-semibold">Información en tiempo real</h2>
            <p className="mt-3 text-slate-300">
              Se muestran datos como nivel de agua, lluvia, batería y estado
              general de cada estación.
            </p>
          </div>
  
          <div className="rounded-2xl bg-white/5 p-5">
            <h2 className="text-xl font-semibold">Escalabilidad</h2>
            <p className="mt-3 text-slate-300">
              Además de la instalación real, la plataforma permite representar
              cómo sería un despliegue más amplio a nivel nacional.
            </p>
          </div>
        </section>
  
        <section className="rounded-3xl bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Enfoque del proyecto</h2>
          <p className="mt-4 text-slate-300">
            HydrIA es una plataforma orientada a la monitorización y visualización
            de datos relacionados con el riesgo de inundación, con un enfoque de
            consulta pública, prevención y posible extensión futura a más puntos
            de control.
          </p>
        </section>
      </div>
    );
  }