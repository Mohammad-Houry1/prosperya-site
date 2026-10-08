<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\PhoneNumber;
use App\Support\CurrentTenant;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * Appointments booked from the doctor appointment app. The CMS lists and
 * edits them (status, reschedule); it never creates them.
 */
class DoctorAppointment extends ContentEntity
{
    use Trashable;

    protected $table = 'doctor_appointments';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public bool $canCreate = false;

    public bool $allowCloning = false;

    public bool $export = false;

    public array $dependents = [];

    public array $searchable = ['name', 'patient_email', 'appointment_notes'];

    public array $defaultSort = ['column' => 'appointment_at', 'direction' => 'desc'];

    protected $appends = ['appointment_at_input'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Patient', 'sortable' => true, 'localized' => true],
        ['key' => 'patient_email', 'name' => 'Patient Email', 'sortable' => true],
        ['key' => 'doctor', 'name' => 'Doctor', 'type' => 'object', 'source' => 'doctors', 'getter' => 'getDoctorsList'],
        ['key' => 'clinic', 'name' => 'Clinic', 'type' => 'object', 'source' => 'clinics', 'getter' => 'getClinicsList'],
        ['key' => 'appointment_at', 'name' => 'Appointment', 'sortable' => true, 'type' => 'datetime'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'created_at', 'name' => 'Booked', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'doctor_appointments', 'getter' => 'getStatusesList'],
        ['key' => 'doctor', 'name' => 'All Doctors', 'type' => 'select', 'source' => 'doctors', 'getter' => 'getDoctorsList'],
        ['key' => 'clinic', 'name' => 'All Clinics', 'type' => 'select', 'source' => 'clinics', 'getter' => 'getClinicsList'],
        ['key' => 'medical_service', 'name' => 'All Medical Services', 'type' => 'select', 'source' => 'medical_services', 'getter' => 'getMedicalServicesList'],
        ['key' => 'consultation_type', 'name' => 'All Consultation Types', 'type' => 'select', 'source' => 'consultation_types', 'getter' => 'getConsultationTypesList'],
        ['key' => 'appointment_at', 'name' => 'Appointment Date', 'type' => 'date_range'],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'appointment_at' => 'datetime'];
    }

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];
        $live = fn (string $model) => Rule::exists($model, '_id')
            ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'));

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'patient_email' => [...$sometimes, 'required', 'string', 'email', 'max:254'],
            'patient_phone' => ['nullable', new PhoneNumber($tenantId)],
            'doctor' => [...$sometimes, 'required', 'string', $live(Doctor::class)],
            'clinic' => [...$sometimes, 'required', 'string', $live(Clinic::class)],
            'consultation_type' => ['nullable', 'string', $live(ConsultationType::class)],
            'medical_service' => ['nullable', 'string', $live(MedicalService::class)],
            'cancellation_reason' => ['nullable', 'string', $live(CancellationReason::class)],
            'appointment_at' => [...$sometimes, 'required', 'date'],
            'appointment_notes' => ['nullable', 'string', 'max:5000'],
            'status' => [...$sometimes, 'required'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    /** The `datetime-local` form value, read and written in the application timezone. */
    public function getAppointmentAtInputAttribute(): string
    {
        return $this->appointment_at ? Carbon::parse($this->appointment_at)->format('Y-m-d\TH:i') : '';
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('doctor_appointments')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getDoctorsList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return Doctor::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getClinicsList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return Clinic::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getConsultationTypesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return ConsultationType::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getMedicalServicesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return MedicalService::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getCancellationReasonsList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return CancellationReason::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }
}
