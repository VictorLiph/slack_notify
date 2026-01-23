with tb_join_formated as (
select distinct on (t1.employee_id, reference_date)
	   trim(INITCAP(lower(full_name))) as name,
	   lower(email) as email,
	   reference_date,
	   expected_time,
	   upper(shift_type) as shift_type


from employees as t1

left join schedules as t2
on t1.employee_id = t2.employee_id

left join slack_config as t3
on t1.employee_id = t3.employee_id

where is_active = true

order by t1.employee_id, t2.reference_date, t2.expected_time
)

select * from tb_join_formated