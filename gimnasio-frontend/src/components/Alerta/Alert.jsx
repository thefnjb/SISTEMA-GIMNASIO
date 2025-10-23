import {Alert} from "@heroui/react";

export function AlertaCredenciales() {
  return (
    <div className="flex items-center justify-center w-full">
      <Alert
        color="danger"
        description="Las credenciales son incorrectas."
        title="Credenciales incorrectas"
        variant="faded"
      />
    </div>
  );
}

export function AlertaLoginExitoso() {
  return (
    <div className="flex items-center justify-center w-full">
      <Alert
        color="success"
        description="¡Bienvenido! Iniciando sesión..."
        title="Login exitoso"
        variant="faded"
      />
    </div>
  );
}

const MultiAlertas = () => {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col w-full">
        {["default", "primary", "secondary", "success", "warning", "danger"].map((color) => (
          <div key={color} className="flex items-center w-full my-3">
            <Alert color={color} title={`This is a ${color} alert`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertaCredenciales;
export {MultiAlertas};
