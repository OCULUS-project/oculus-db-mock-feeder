#!/bin/bash
file_prefix="f_"
file_id_n="1"

for (( i=1; i<=100; i++ ))
do
    printf -v id "%09d" $file_id_n
    file_id_n=$((file_id_n+1))
    new_file="$file_prefix$id"
    mkdir $new_file
    for (( j=$i*10-9; j<=$i*10; j++ )) 
    do    
        printf -v num "%04d" $j
        img="img_$num.jpg"
        echo $img
        mv $img $new_file/$img
    done
done

