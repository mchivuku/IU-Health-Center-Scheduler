<!-- Render this partial view when you want to enable client-side sorting, pagination and filtering of a table. -->
<?php

    $jsSortDef = "";
    if ($model->sortableColumns != null && count($model->sortableColumns)>0)
    {
         array_walk($model->sortableColumns, function( $item)use(&$sortConfig){
         if($item=='NoSort')
             $sortConfig[]=  "{'bSortable' : false}";
              $sortConfig[] = sprintf("%s", SortClass::getDataTableSortClass($item));
         }
         );

        $jsSortDef = sprintf(", 'aoColumns' : [ {%s} ]", join(",\n", $sortConfig));
    }

        $pagingIncrements =  array(10, 20, 50, 100);
        $fmtPagingOption = "<option value=\"{0}\">%s</option>";
        $fmtPagingShowAllOption = "<option value=\"{%s}\">All {%s}</option>";
        $getPagingOptions =function($total)use(&$fmtPagingOption,$pagingIncrements,$fmtPagingShowAllOption)
        {
                $builder = '';
                foreach ($pagingIncrements  as $item)
                {
                  if($total >$item)
                  $builder.= sprintf($fmtPagingOption,$item);
                  else
                  break;

                }
                $builder.= sprintf($fmtPagingShowAllOption,$item);
                return $builder;
            };


?>
<script type="text/javascript">
    $(document).ready(function() {
        $('table#pastAppts').dataTable({
            responsive: true,
            'bJQueryUI': false,
            'bProcessing': true,
            'bSortClasses': false,
            'aaSorting': [],
            'asStripClasses': ['odd', 'even'],
            'sLength': 'inline-help',
            'sInfo': 'inline-help',
            "paging":   false


        });

    });

</script>