


  <div class="personal-info">
                    <h2>Personal Information</h2>
                    <div>
                    <p>If you need to update your personal information, please notify one of our staff members at your next visit to the Health Center.</p>

                        <ul>
                            <li><strong>Name</strong>: <?php echo $profile->getName();?></li>
                            <li><strong>IU ID</strong>: <?php echo $profile->universityId;?></li>
                            <li><strong>Date of Birth</strong>: <?php echo $profile->dateOfBirth;?></li>
                            <li><strong>Email</strong>: <?php echo $profile->email;?></li>
                            <li><strong>Address Line 1</strong>: <?php echo $profile->addressLine1;?></li>
                            <li><strong>Address Line 2</strong>: <?php echo $profile->addressLine2;?></li>
                            <li><strong>City</strong>: <?php echo $profile->city;?></li>
                            <li><strong>State</strong>: <?php echo $profile->state;?></li>
                            <li><strong>Zip Code</strong>: <?php echo $profile->zipCode;?></li>
                            <li><strong>Phone</strong>: <?php echo $profile->getPhone();?></li>


                            <li><strong>Text Enabled</strong>:
                            <?php if($profile->textEnabled==1){
                            ?>
                               <a href="{{ URL::to('settings')}}">Yes</a>
                            <?}else{?>
                              <a href="{{ URL::to('settings')}}">No</a>
                            <?}
                            ?>

                        </ul>
                    </div>
                </div>