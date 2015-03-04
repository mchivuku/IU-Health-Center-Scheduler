<div class="available-timeslots">
<div id="available-times" class="{{strtolower($model->tabs[$model->activeTab])}}" style="display:block;">
{{ HTML::display_times($model->scheduler_slots)}}
</div>
{{Form::hidden('firstAvailableProvider',isset($model->firstAvailableProvider)?$model->firstAvailableProvider:null,array('id'=>'firstAvailableProvider'));}}
</div>



