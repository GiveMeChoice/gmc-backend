export class RainforestApiCollectionDto {
  collection: {
    id: string;
    created_at: Date;
    last_run: Date;
    name: string;
    schedule_type: string;
    enabled: boolean;
    status: string;
    requests_total_count: number;
    requests_page_count: number;
    credits_required: number;
    next_result_set_id: number;
    results_count: number;
    priority: string;
  };
}
