
@if($model->errorMsg!="")
<div id="error">{{$model->errorMsg}}</div>

@endif

<div id="available-times" class="{{strtolower($model->tabs[$model->activeTab])}}" style="display:block;">

{{ HTML::display_times($model->scheduler_slots)}}
</div>
{{Form::hidden('firstAvailableProvider',isset($model->firstAvailableProvider)?$model->firstAvailableProvider:null,array('id'=>'firstAvailableProvider'));}}
 {{Form::hidden('visitDuration',
$model->visitDuration,array('id'=>'visitDuration','name'=>'visitDuration'));}}
</div>

