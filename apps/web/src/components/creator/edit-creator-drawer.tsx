"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save01, Trash01, X } from "@untitledui/icons";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { CreatorLeadData } from "./creator-lead-data";

interface EditCreatorDrawerProps {
  creatorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const creatorTypeLabels: Record<string, string> = {
  UGC_CREATOR: "UGC Creator",
  EMBAIXADOR: "Embaixador",
  ATLETA: "Atleta",
  INFLUENCIADOR: "Influenciador",
  ATOR_MODELO: "Ator/Modelo",
};

type CreatorType = "UGC_CREATOR" | "EMBAIXADOR" | "ATLETA" | "INFLUENCIADOR" | "ATOR_MODELO";

function toCalendarDate(date: string | Date | null | undefined): DateValue | null {
  if (!date) return null;
  const d = new Date(date);
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function EditCreatorDrawer({ creatorId, open, onOpenChange }: EditCreatorDrawerProps) {
  const queryClient = useQueryClient();
  const { uploadFileWithMetadata, isUploading } = useFileUpload();

  const [name, setName] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{ url: string; fileId?: string; fileName?: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [type, setType] = useState<CreatorType>("UGC_CREATOR");
  const [responsibleId, setResponsibleId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [contractStartDate, setContractStartDate] = useState<DateValue | null>(null);
  const [contractEndDate, setContractEndDate] = useState<DateValue | null>(null);
  const [notes, setNotes] = useState("");

  const { data: creator, isLoading: loadingCreator } = useQuery({
    ...trpc.creator.getById.queryOptions({ id: creatorId! }),
    enabled: !!creatorId && open,
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery(
    trpc.user.list.queryOptions({ limit: 100 })
  );

  useEffect(() => {
    if (creator && open) {
      setName(creator.name);
      setUploadedImage(creator.imageUrl ? { url: creator.imageUrl } : null);
      setUploadProgress(0);
      setType(creator.type as CreatorType);
      setResponsibleId(creator.responsibleId);
      setEmail(creator.email || "");
      setPhone(creator.phone || "");
      setInstagram(creator.instagram || "");
      setContractStartDate(toCalendarDate(creator.contractStartDate));
      setContractEndDate(toCalendarDate(creator.contractEndDate));
      setNotes(creator.notes || "");
    }
  }, [creator, open]);

  useEffect(() => {
    if (!open) {
      setName("");
      setUploadedImage(null);
      setUploadProgress(0);
      setType("UGC_CREATOR");
      setResponsibleId("");
      setEmail("");
      setPhone("");
      setInstagram("");
      setContractStartDate(null);
      setContractEndDate(null);
      setNotes("");
    }
  }, [open]);

  const handleImageDrop = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setUploadProgress(0);
    const result = await uploadFileWithMetadata(file, setUploadProgress);
    if (result?.file) {
      setUploadedImage({
        url: result.url,
        fileId: result.file.id,
        fileName: result.file.name,
      });
      toast.success("Foto enviada com sucesso!");
    }
  }, [uploadFileWithMetadata]);

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setUploadProgress(0);
  }, []);

  const updateMutation = useMutation({
    ...(trpc.creator.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Criador atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [["creator"]] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!creatorId) return;

    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!responsibleId) {
      toast.error("Responsável é obrigatório");
      return;
    }

    (updateMutation.mutate as any)({
      id: creatorId,
      name,
      imageUrl: uploadedImage?.url || null,
      type,
      responsibleId,
      email: email || null,
      phone: phone || null,
      instagram: instagram || null,
      contractStartDate: contractStartDate ? contractStartDate.toDate(getLocalTimeZone()) : null,
      contractEndDate: contractEndDate ? contractEndDate.toDate(getLocalTimeZone()) : null,
      notes: notes || null,
    });
  };

  const isValid = name.trim() && responsibleId;

  return (
    <SlideoutMenu isOpen={open} onOpenChange={onOpenChange} dialogAriaLabel="Editar Criador" modalClassName="max-w-5xl">
      {({ close }) => (
        <>
          <div className="relative z-1 flex items-start justify-between w-full px-4 pt-6 md:px-6">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={close}
                className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                aria-label="Fechar"
              >
                <FeaturedIcon
                  icon={X}
                  theme="light"
                  color="gray"
                  size="md"
                />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  Editar Criador
                </h2>
                <p className="text-sm text-tertiary mt-1">
                  Atualize as informações do criador.
                </p>
              </div>
            </div>
          </div>

          <SlideoutMenu.Content>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna Esquerda - Form */}
              <div>
                {loadingCreator ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-40 w-full" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-24" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ) : (
                  <form id="edit-creator-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                        Informações Básicas
                      </h3>

                      <Input
                        label="Nome *"
                        value={name}
                        onChange={setName}
                        placeholder="Nome completo"
                        isRequired
                      />

                      <div>
                        <label className="text-sm font-medium text-secondary mb-1.5 block">
                          Foto
                        </label>
                        {uploadedImage ? (
                          <div className="relative group rounded-xl overflow-hidden ring-1 ring-secondary">
                            <img
                              src={uploadedImage.url}
                              alt="Foto do criador"
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/90 text-error-primary hover:bg-white"
                                aria-label="Remover foto"
                              >
                                <Trash01 className="size-5" />
                              </button>
                            </div>
                            {uploadedImage.fileName && (
                              <div className="px-3 py-2 bg-primary text-xs text-tertiary truncate">
                                {uploadedImage.fileName}
                              </div>
                            )}
                          </div>
                        ) : (
                          <FileUpload.DropZone
                            accept="image/*"
                            allowsMultiple={false}
                            maxSize={10 * 1024 * 1024}
                            hint="PNG, JPG ou WebP (máx. 10MB)"
                            isDisabled={isUploading}
                            onDropFiles={handleImageDrop}
                            onDropUnacceptedFiles={() => toast.error("Formato de arquivo não suportado. Use PNG, JPG ou WebP.")}
                            onSizeLimitExceed={() => toast.error("Arquivo muito grande. Máximo: 10MB.")}
                          />
                        )}
                        {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-solid transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          label="Tipo *"
                          selectedKey={type}
                          onSelectionChange={(key) => setType(key as CreatorType)}
                        >
                          {Object.entries(creatorTypeLabels).map(([value, label]) => (
                            <Select.Item key={value} id={value} label={label} />
                          ))}
                        </Select>

                        <Select
                          label="Responsável *"
                          selectedKey={responsibleId}
                          onSelectionChange={(key) => setResponsibleId(key as string)}
                          isDisabled={loadingUsers}
                          placeholder={loadingUsers ? "Carregando..." : "Selecione..."}
                        >
                          {usersData?.items.map((user) => (
                            <Select.Item key={user.id} id={user.id} label={user.name || user.email} />
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                        Contato
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Email"
                          type="email"
                          value={email}
                          onChange={setEmail}
                          placeholder="email@exemplo.com"
                        />

                        <Input
                          label="Telefone/WhatsApp"
                          value={phone}
                          onChange={setPhone}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <Input
                        label="Instagram"
                        value={instagram}
                        onChange={setInstagram}
                        placeholder="@usuario"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                        Contrato
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-secondary mb-1.5 block">
                            Data Início
                          </label>
                          <DatePicker
                            aria-label="Data Início"
                            value={contractStartDate}
                            onChange={setContractStartDate}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-secondary mb-1.5 block">
                            Data Fim
                          </label>
                          <DatePicker
                            aria-label="Data Fim"
                            value={contractEndDate}
                            onChange={setContractEndDate}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                        Observações
                      </h3>

                      <TextArea
                        aria-label="Observações"
                        value={notes}
                        onChange={setNotes}
                        placeholder="Observações, preferências, histórico..."
                        rows={4}
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Coluna Direita - Dados do Lead */}
              <div className="lg:border-l lg:border-secondary lg:pl-6">
                <CreatorLeadData phone={creator?.phone || phone || null} />
              </div>
            </div>
          </SlideoutMenu.Content>

          <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
            <Button
              type="button"
              color="secondary"
              onClick={close}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="edit-creator-form"
              color="primary"
              isDisabled={!isValid || updateMutation.isPending || loadingCreator}
              isLoading={updateMutation.isPending}
              iconLeading={Save01}
            >
              Salvar Alterações
            </Button>
          </SlideoutMenu.Footer>
        </>
      )}
    </SlideoutMenu>
  );
}
