<div class="available-timeslots">
<div class="{{strtolower($model->tabs[$model->activeTab])}}" style="display:block;">
{{ HTML::display_times($model->scheduler_slots)}}
</div>

</div>



