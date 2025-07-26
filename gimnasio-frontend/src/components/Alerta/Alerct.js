import {Alert} from "@heroui/react";

export function AlertaCredenciales() {
  return (
    <div className="flex w-full items-center justify-center">
      <Alert
        color="default"
        description="Las credenciales son incorrectas."
        title="Credenciales incorrectas"
        variant="faded"
      />
    </div>
  );
}

const MultiAlertas = () => {
    return (
    <div className="flex w-full items-center justify-center">
        <div className="flex w-full flex-col">
            {["default", "primary", "secondary", "success", "warning", "danger"].map((color) => (
            <div key={color} className="my-3 flex w-full items-center">
                <Alert color={color} title={`This is a ${color} alert`} />
            </div>
            ))}
        </div>
    </div>
    );
}

export default AlertaCredenciales;
export {MultiAlertas};
