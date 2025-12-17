import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types/database";

const creditCardSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  bank: z.string().min(1, "El banco es requerido"),
  last_four_digits: z.string().max(4, "Máximo 4 dígitos").optional(),
  credit_limit: z.coerce.number().min(0).optional(),
  current_balance: z.coerce.number().default(0),
  cut_off_day: z.coerce.number().min(1).max(31, "Debe ser entre 1 y 31"),
  payment_due_day: z.coerce.number().min(1).max(31, "Debe ser entre 1 y 31"),
  is_active: z.boolean().default(true),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

type Props = {
  onSuccess: () => void;
  initialData?: Tables<"credit_cards">;
};

const days = Array.from({ length: 31 }, (_, i) => i + 1);

export function CreditCardForm({ onSuccess, initialData }: Props) {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreditCardFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(creditCardSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      bank: initialData?.bank ?? "",
      last_four_digits: initialData?.last_four_digits ?? "",
      credit_limit: initialData?.credit_limit ?? undefined,
      current_balance: initialData?.current_balance ?? 0,
      cut_off_day: initialData?.cut_off_day ?? 1,
      payment_due_day: initialData?.payment_due_day ?? 15,
      is_active: initialData?.is_active ?? true,
    },
  });

  const cutOffDay = watch("cut_off_day");
  const paymentDueDay = watch("payment_due_day");
  const isActive = watch("is_active");

  async function onSubmit(data: CreditCardFormData) {
    if (!user) return;

    const cardData = {
      name: data.name,
      bank: data.bank,
      last_four_digits: data.last_four_digits || null,
      credit_limit: data.credit_limit ?? null,
      current_balance: data.current_balance,
      cut_off_day: data.cut_off_day,
      payment_due_day: data.payment_due_day,
      is_active: data.is_active,
      user_id: user.id,
    };

    if (initialData) {
      const { error } = await supabase
        .from("credit_cards")
        .update(cardData)
        .eq("id", initialData.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("credit_cards").insert(cardData);

      if (error) throw error;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la tarjeta</Label>
          <Input id="name" placeholder="Ej: Visa Oro" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank">Banco</Label>
          <Input id="bank" placeholder="Ej: BBVA" {...register("bank")} />
          {errors.bank && (
            <p className="text-sm text-red-500">{errors.bank.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="last_four_digits">Últimos 4 dígitos</Label>
          <Input
            id="last_four_digits"
            placeholder="1234"
            maxLength={4}
            {...register("last_four_digits")}
          />
          {errors.last_four_digits && (
            <p className="text-sm text-red-500">
              {errors.last_four_digits.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="credit_limit">Límite de crédito</Label>
          <Input
            id="credit_limit"
            type="number"
            placeholder="50000"
            {...register("credit_limit")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="current_balance">Saldo actual</Label>
        <Input
          id="current_balance"
          type="number"
          placeholder="0"
          {...register("current_balance")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Día de corte</Label>
          <Select
            value={String(cutOffDay)}
            onValueChange={(value) => setValue("cut_off_day", Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona día" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              className="max-h-50 overflow-y-auto"
            >
              {days.map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.cut_off_day && (
            <p className="text-sm text-red-500">{errors.cut_off_day.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Día de pago</Label>
          <Select
            value={String(paymentDueDay)}
            onValueChange={(value) =>
              setValue("payment_due_day", Number(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona día" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              className="max-h-50 overflow-y-auto"
            >
              {days.map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.payment_due_day && (
            <p className="text-sm text-red-500">
              {errors.payment_due_day.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue("is_active", checked === true)}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Tarjeta activa
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
      </Button>
    </form>
  );
}
