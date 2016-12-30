---
title: Deploying a platform with a single click using AWS and Terraform
dateISO: 20161230
author: danielsteig
thumbnail: terraform.png
---

[deepstreamHub](https://deepstreamhub.com/), our upcoming realtime data platform lives in the AWS cloud, a solid foundation for the project to grow. When it was time to set up a proper production environment, we decided to create a new AWS account to start from scratch without unnecessary configurations or components.

<img src="aws-elton.png" alt="AWS Elton" width="200" />

We discussed extensively how to approach deployment and eventually set out to write scripts using the AWS CLI and other libraries to allow for automated component-creation. But already with the first EC2 instance and its configuration managed this way we began to get an idea of how big and time consuming this approach would get. On top of this it was crucial for us to remain flexible and allow for easy architecture-improvements as the platform takes shape. We already knew that it would take quite a few iterations and direction changes to get to a stage where we were entirely happy with the result.
                    
In the light of all these challenges it became clear that we needed to find a better solution to support us on our mission to be able to deploy our platform from scratch in a structured, scalable and reproducible way using the full AWS ecosystem.
                    
Another major focus was readability. We wanted our configurations to act as a single source of truth which could be versioned and backtraced.
                                    
## That was when we remembered Terraform                  
Most of the team had heard of [Terraform](https://www.terraform.io/), but none had really started digging into it. Its mission statement is "Infrastructure as Code" which sounded a lot like what we needed.
                    
Developed by [Hashicorp](https://www.hashicorp.com/): "Terraform enables you to safely and predictably create, change, and improve production infrastructure. It is an open source tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned."

## Getting started      
We began looking at our existing development infrastructure which was built using the AWS console only. Going through the components we roughly sketched our new platform layout. Our first milestone was to reproduce it in the new, empty AWS account.
                    
Starting with a flat file called `stack.tf` and a corresponding `variables.tf` file, we got a pretty good quick start on using the Terraform toolkit.
                    
After about two days we had the first EC2 machines up with their corresponding security groups, launch configurations and IAM Roles. We found the documentation quite good and managed to add more AWS services like autoscaling_groups or an ECS cluster within a short amount of time.        
                    
```javascript
resource "aws_autoscaling_group" "my_first_autoscaling_group" {
  vpc_zone_identifier = ["${split(",", var.aws_subnet_ids)}"]
  name         = "my_first_autoscaling_group"
  min_size             = "${var.min_instances_size}"
  max_size             = "${var.max_instances_size}"
  desired_capacity     = "${var.desired_instances_size}"
  launch_configuration = "${aws_launch_configuration.my_first_launchconfig.name}"
  termination_policies = ["OldestInstance"]
  tag {
    key                 = "Name"
    value               = "my_first_autoscaling_group"
    propagate_at_launch = "true"
  }
  lifecycle {
    prevent_destroy = true
  }
}
```

As you can see in the small snippet, there are several great features to make your life easier such as the various possibilities to interpolate variables, `split`, `distinct` etc.
            
Lifecycles are just as helpful when it comes to preventing resources from being destroyed whilst running a full destroy on your terraform infrastructure. You seriously wouldn’t want your database and all its data to suddenly accidently vanish.                         

To learn more about terraforms `aws_autoscaling_group` head [here](https://www.terraform.io/docs/providers/aws/r/autoscaling_group.html).
                        
One thing you want to do right away, is to setup a shared [terraform_remote_state](https://www.terraform.io/docs/providers/terraform/d/remote_state.html). We store it in a s3 bucket, in order for it to work with multiple people on the stack, otherwise you’d end up breaking it every time someone applied something in their local state.
                                                
## Learning by doing                 
One important lesson we’ve learned early on was the necessity to extract as many variables as possible into a file called `variables.tf`. 
                    
Another lesson was the need to fully understand and utilize modules as early as possible. As we’ve seen earlier, we had to destroy and recreate our entire infrastructure frequently to ensure everything coming together and fully working without any manual interaction. This is all the more necessary for a highly scalable multi region.
                    
Since we were still on a flat file for our complete infrastructure, we had to tear down the whole stack every time, which took significant amounts of time, regardles how small the change. What came to the rescue where - modules!
                    
## Modules, Modules, Modules!      
We’ve enforced the use of modules, enabling us to just create, modify and delete certain parts of the stack using `terraform apply - target=module.mymodule` 
But this required us to extract _all_ variables into the variables file and change the layout of our repo. Once sorted however we were able to reuse our modules as often as necessary to create the required infrastructure components:
                    
```javascript
module "one" {
  source  = "./deepstream-stack"
  variable1 =  "${var.variable1}"
}

module "two" {
  source  = "./deepstream-stack"
  variable1 =  "${var.variable1}"
  variable2 =  "${var.variable2}"
}
```

## Dependencies          
Armed with our more granular setup we’ve faced another challenge: managing the inter-dependencies of the various components within the AWS world. Terraform does a great job at figuring out the dependency tree signalling when to create which part of a service in which order, but occasionally it reaches limits. In our case we could see errors when creating auto scaling groups as well as complaints about uncreated IAM Roles, which were clearly covered in our code. Occasionally running `terraform apply` repeatedly fixed this issue, other times using `depends_on` did the job.
                    
But more often it proved surprisingly hard to find the root of the problem due to the lack of details provided within the AWS errors - which are getting passed by Terraform - are lacking information. These can however be overcome by careful debugging and the ever present help of search engines.
                    
## The future          
At the moment it takes about 15-20min to launch a complete stack within an AWS region, from a blank AWS account. We are planning to speed things up using [Packer](https://www.packer.io/), a toolset for baking AMI Images by the same company that developes Terraform. It will speed up the launch of EC machines and will help us to pin certain versions of tools in our infrastructure. We also need to do some refactoring in order to support cross-region deployments and of course are continuously trying to improve the way we handle things. 
        
