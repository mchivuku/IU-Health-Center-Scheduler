 <span class="step">2</span>
 <label>Select a Provider</label>
         <div class="section-dropdown">
                     {{ Form::select_list('provider',$model->providers,$model->selectedProvider,array('id'=>'providers')) }}

                     </div>
    </div>

 <div class="column schedule-appointments">

     <div class="timeslots">
     <span class="step block">3</span>

     <ul class="time-of-day">
     @foreach($model->tabs as $k=>$v)

     @if( $model->activeTab == $k)
     <li class="{{$v}} active">{{$v}}</li>

     @else
     <li class="{{$v}}">{{$v}}</li>

     @endif
     @endforeach
     </ul>

        @include('includes.timeslots',array('model'=>$model))
 </div>
